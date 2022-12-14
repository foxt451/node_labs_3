import { parse } from "regexparam";

type Handler = (...args: never[]) => void;

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
    this.routes
      .filter((route) => route.method === "" || route.method === method)
      .filter((route) => route.pattern.test(path))
      .forEach((route) => {
        // use this object later
        const matches = route.pattern.exec(path);
        if (matches === null) {
          return;
        }
        handlers.push(...route.handlers);
        if (route.keys.length === 0) {
          return;
        }
        route.keys.forEach((key, i) => {
          params[key] = matches[i + 1];
        });
      });
    return { handlers, params };
  }
}
