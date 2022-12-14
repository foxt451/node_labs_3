import http from "http";
import { MyRouter } from "@/my-router";
import { errorJsonApi } from "./helpers/json-api";

const defaultOnError = (err, _, res) => {
  errorJsonApi(res, [err]);
};

const HTTP_REFRESH = {
  "Content-Type": "text/html",
  Refresh: "5",
};

export class MyServer {
  globalMiddlewares = [];
  apps = {};
  basedMiddleware = {};
  router = new MyRouter();
  onError;
  server;
  connections = new Map();
  onShutdown;
  isShuttingDown;
  SHUTDOWN_TIMEOUT_MS = 5000;

  constructor(options = {}) {
    this.onError = options.onError ?? defaultOnError;
    this.server = options.server;
    this.onShutdown = options.onShutdown;
  }

  addHandler(method, path, ...handlers) {
    this.router.add(method, path, handlers);
  }

  useWare(base, ...handlers) {
    if (base === "" || base === "/") {
      this.globalMiddlewares.push(...handlers);
      return;
    }
    if (typeof base !== "string") {
      this.globalMiddlewares.push(base, ...handlers);
      return;
    }

    for (const handler of handlers) {
      if (handler instanceof MyServer) {
        this.apps[base] = handler;
        continue;
      }
      const arr = this.basedMiddleware[base];
      this.basedMiddleware[base] = arr ? [...arr, handler] : [handler];
    }
  }

  static getBase(path) {
    const lastSlash = path.indexOf("/", 1);
    return lastSlash === -1 ? path : path.slice(0, lastSlash);
  }

  static removeBaseFromReq(base, req) {
    req.url = req.url?.slice(base.length) ?? "/";
    req.path = req.path?.slice(base.length) ?? "/";
  }

  handler(req, res) {
    req.url ??= "";
    if (!req.url.startsWith("/")) {
      req.url = "/" + req.url;
    }
    req.method ??= "GET";
    req.params ??= {};

    const url = new URL(req.url, `http://${req.headers.host ?? "default.com"}`);
    req.originalUrl = req.originalUrl ?? req.url;
    req.path = url.pathname;
    const base = MyServer.getBase(url.pathname);
    const wares = [...this.globalMiddlewares];
    const requestMatch = this.router.find(url.pathname, req.method);
    let handlers = [];
    const basedMiddleware = this.basedMiddleware[base];
    if (basedMiddleware) {
      wares.push(...basedMiddleware);
    }
    const app = this.apps[base];
    if (requestMatch.handlers.length > 0) {
      req.params = requestMatch.params;
      handlers = requestMatch.handlers;
    } else if (app) {
      MyServer.removeBaseFromReq(base, req);
      handlers.push(app.handler.bind(app, req, res));
    }
    req.search = url.search;

    let curHandlerInd = 0;
    const loop = (next) => {
      if (res.writableEnded || curHandlerInd >= wares.length) {
        return;
      }
      wares[curHandlerInd++](req, res, next);
    };
    const next = (error) =>
      error ? this.onError(error, req, res) : loop(next);

    wares.push(...handlers);
    loop(next);
  }

  listen(port, hostname, backlog, listeningListener) {
    this.server ??= http.createServer();
    this.server.on("request", (req, res) => {
      if (res.socket) {
        console.log("New request");
        this.connections.set(res.socket, res);
      }
      this.handler(req, res);
    });
    this.server.on("connection", (connection) => {
      console.log("New connection");
      connection.on("close", () => {
        console.log("Closed connection");
        this.connections.delete(connection);
      });
    });
    process.on("SIGINT", () => {
      if (this.isShuttingDown) {
        console.log("Duplicate SIGINT");
        return;
      }
      this.isShuttingDown = true;
      console.log("Graceful shutdown");
      this.showConnections();
      this.gracefulShutdown(() => {
        this.showConnections();
        this.onShutdown?.();
        console.log("Bye");
      });
    });
    this.server.listen(port, hostname, backlog, listeningListener);
  }

  showConnections() {
    console.log("Connection:", [...this.connections.values()].length);
    for (const connection of this.connections.keys()) {
      const { remoteAddress, remotePort } = connection;
      console.log(`${remoteAddress ?? "-"}:${remotePort ?? "-"}`);
    }
  }

  closeConnections() {
    for (const [connection, res] of this.connections.entries()) {
      this.connections.delete(connection);
      res.writeHead(503, HTTP_REFRESH);
      res.end("Server stopped");
      connection.destroy();
    }
  }

  gracefulShutdown(callback) {
    this.server?.close((error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      callback();
      // resume default behaviour of exiting process
      process.exit();
    });
    // give hanging requests some time to finish
    setTimeout(() => {
      this.closeConnections();
    }, this.SHUTDOWN_TIMEOUT_MS);
  }
}
