import { BadRequestError } from "@/errors";
import { NextFunction, Request } from "@/types/server";
import { AnySchema, ValidationError } from "yup";

export const yupParamsValidationMiddleware =
  (schema: AnySchema) =>
  async (req: Request, _: unknown, next: NextFunction) => {
    try {
      await schema.validate(req.params);
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      next(new BadRequestError("Invalid request params"));
    }
  };
