import { BadRequestError } from "@/errors";
import { NextFunction, Request } from "@/types/server";
import formidable from "formidable";

const form = formidable({
  uploadDir: "/tmp",
  keepExtensions: false,
});

export const formdata = (
  req: Request,
  _: unknown,
  next: NextFunction
): void => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    next();
    return;
  }
  form.parse(req, (err, fields) => {
    if (err) {
      next(new BadRequestError("Failed to parse form data"));
      return;
    }
    req.body = fields;
    next();
  });
};
