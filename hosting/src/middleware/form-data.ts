import formidable from "formidable";
import { BodyFunctionHandler, FunctionHandler, Request } from "../my-server";

const form = formidable();

type FormdataAttach = Request & {
  body?: formidable.Fields;
};

export const formdata: FunctionHandler = (
  req: FormdataAttach,
  res,
  next
): void => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    next();
    return;
  }
  form.parse(req, (err, fields) => {
    if (err) {
      next(err);
      return;
    }
    req.body = fields;
    next();
  });
};

export type FormdataHandler<T extends formidable.Fields = formidable.Fields> =
  BodyFunctionHandler<T>;
