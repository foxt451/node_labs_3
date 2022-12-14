import { RequestParams } from "@/my-router";
import { IncomingMessage } from "http";

interface RequestBloat<TBody> {
  originalUrl: string;
  params: RequestParams;
  path: string;
  search: string;
  body: TBody;
}
export type Request<TBody = unknown> = IncomingMessage & RequestBloat<TBody>;
export type NextFunction = (error?: unknown) => void;
