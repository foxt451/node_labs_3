import http, { Server, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { MyRouter, RequestParams } from "./my-router";

type ErrorHandler = (err: unknown, req: Request, res: ServerResponse) => void;

interface ServerOptions {
  server?: Server;
  onError?: ErrorHandler;
  // only makes sense for the top application
  onShutdown?: () => void;
}

export type FunctionHandler<R = Request, S = ServerResponse> = (
  req: R,
  res: S,
  next: (error?: unknown) => void
) => void | Promise<void>;
type SubApp = MyServer;
type Handler = SubApp | FunctionHandler;

interface RequestBloat {
  originalUrl: string;
  params: RequestParams;
  path: string;
  search: string;
}
type RequestBuilder = IncomingMessage & Partial<RequestBloat>;
type Request = IncomingMessage & RequestBloat;

type JsonRequest<T> = Request & {
  body: T;
};

export type JsonFunctionHandler<T> = FunctionHandler<JsonRequest<T>>;

const defaultOnError: ErrorHandler = (err, req, res) => {
  if (typeof err === "string" || Buffer.isBuffer(err)) {
    res.end(err);
  } else {
    if (err instanceof Error) {
      res.end(err.message);
    }
    res.end("Error");
  }
};

export class MyServer {
  private globalMiddlewares: FunctionHandler[] = [];
  private apps: Partial<Record<string, SubApp>> = {};
  private basedMiddleware: Partial<Record<string, FunctionHandler[]>> = {};
  private router: MyRouter = new MyRouter();
  private onError: ErrorHandler;
  private server: Server | undefined;
  private connections = new Map<Socket, ServerResponse>();
  private onShutdown?: () => void;
  private isShuttingDown?: boolean = false;

  constructor(options: ServerOptions = {}) {
    this.onError = options.onError ?? defaultOnError;
    this.server = options.server;
    this.onShutdown = options.onShutdown;
  }

  public addHandler<R = Request, S = ServerResponse>(
    method: string,
    path: string,
    ...handlers: FunctionHandler<R, S>[]
  ): void {
    this.router.add(method, path, handlers as (() => void)[]);
  }

  public useWare(base: string | Handler, ...handlers: Handler[]) {
    if (base === "" || base === "/") {
      this.globalMiddlewares.push(...(handlers as FunctionHandler[]));
    } else if (typeof base !== "string") {
      this.globalMiddlewares.push(
        base as FunctionHandler,
        ...(handlers as FunctionHandler[])
      );
    } else {
      for (const handler of handlers) {
        if (handler instanceof MyServer) {
          this.apps[base] = handler;
        } else {
          const arr = this.basedMiddleware[base];
          this.basedMiddleware[base] = arr ? [...arr, handler] : [handler];
        }
      }
    }
  }

  private static getBase(path: string): string {
    const lastSlash = path.indexOf("/", 1);
    return lastSlash === -1 ? path : path.slice(0, lastSlash);
  }

  private static removeBaseFromReq(base: string, req: RequestBuilder) {
    req.url = req.url?.slice(base.length) ?? "/";
    req.path = req.path?.slice(base.length) ?? "/";
  }

  public handler(req: RequestBuilder, res: ServerResponse): void {
    if (req.url === undefined) {
      req.url = "/";
    }
    if (!req.url.startsWith("/")) {
      req.url = "/" + req.url;
    }
    if (req.method === undefined) {
      req.method = "GET";
    }
    if (!req.params) {
      req.params = {};
    }
    const url = new URL(req.url, `http://${req.headers.host ?? "default.com"}`);
    req.originalUrl = req.originalUrl ?? req.url;
    req.path = url.pathname;
    const base = MyServer.getBase(url.pathname);
    const wares: FunctionHandler[] = [...this.globalMiddlewares];
    const requestMatch = this.router.find(url.pathname, req.method);
    let handlers: FunctionHandler[] = [];
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
    const loop = (next: (error?: unknown) => void) => {
      if (res.writableEnded) {
        return;
      }
      if (curHandlerInd >= wares.length) {
        return;
      }
      void wares[curHandlerInd++](req as Request, res, next);
    };
    const next = (error?: unknown) =>
      error ? this.onError(error, req as Request, res) : loop(next);

    wares.push(...handlers);
    loop(next);
  }

  public listen(
    port?: number | undefined,
    hostname?: string | undefined,
    backlog?: number | undefined,
    listeningListener?: (() => void) | undefined
  ): void {
    (this.server = this.server ?? http.createServer()).on(
      "request",
      (req, res) => {
        if (res.socket) {
          console.log("New req");
          this.connections.set(res.socket, res);
        }
        this.handler(req, res);
      }
    );
    this.server.on("connection", (connection) => {
      console.log("New conn");
      connection.on("close", () => {
        console.log("Close conn");
        this.connections.delete(connection);
      });
    });
    process.on("SIGINT", () => {
      if (this.isShuttingDown) {
        console.log("Duplicate SIGINT");
        return;
      } else {
        this.isShuttingDown = true;
      }
      console.log("Graceful shutdown");
      this.showConnections();
      this.gracefulShutdown(() => {
        this.showConnections();
        this.onShutdown?.();
        console.log("Bye");
        // resume default behaviour of exiting process
        process.exit();
      });
    });
    this.server.listen(port, hostname, backlog, listeningListener);
  }

  public showConnections() {
    console.log("Connection:", [...this.connections.values()].length);
    for (const connection of this.connections.keys()) {
      const { remoteAddress, remotePort } = connection;
      console.log(`${remoteAddress ?? "-"}:${remotePort ?? "-"}`);
    }
  }

  private closeConnections() {
    for (const [connection, res] of this.connections.entries()) {
      this.connections.delete(connection);
      res.end("Server stopped");
      connection.destroy();
    }
  }

  public gracefulShutdown(callback: () => void) {
    this.server?.close((error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      callback();
    });
    this.closeConnections();
  }
}
