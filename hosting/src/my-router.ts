import { parse } from "regexparam";

type Handler = (...args: unknown[]) => void;

interface Route {
  pattern: RegExp;
  method: string;
  keys: string[];
  handlers: Handler[];
}

export type RequestParams = Record<string, string>;

interface RequestMatchResult {
  params: RequestParams;
  handlers: Handler[];
}

export class MyRouter {
  private routes: Route[] = [];

  public add(method: string, path: string, handlers: Handler[]): void {
    const { keys, pattern } = parse(path);
    const route: Route = {
      keys,
      handlers,
      method,
      pattern,
    };
    this.routes.push(route);
  }

  public use(path: string, handlers: Handler[]): void {
    const { keys, pattern } = parse(path, true);
    const route: Route = {
      keys,
      handlers,
      method: "",
      pattern,
    };
    this.routes.push(route);
  }

  public find(path: string, method: string): RequestMatchResult {
    const handlers: Handler[] = [];
    const params: RequestParams = {};
    for (const route of this.routes) {
      if (!MyRouter.matchMethods(route.method, method)) {
        continue;
      }
      const matches = route.pattern.exec(path);
      if (matches === null) {
        continue;
      }
      handlers.push(...route.handlers);
      if (route.keys.length > 0) {
        for (let i = 0; i < route.keys.length; i++) {
          params[route.keys[i]] = matches[i + 1];
        }
      }
    }
    return { handlers, params };
  }

  private static matchMethods(
    routeMethod: string,
    requestMethod: string
  ): boolean {
    return routeMethod === "" || requestMethod === routeMethod;
  }
}
