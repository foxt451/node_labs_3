import { BadRequestError } from "@/errors";
import { NextFunction, Request } from "@/types/server";
import { AnySchema, ValidationError } from "yup";

export const yupBodyValidationMiddleware =
  (schema: AnySchema) =>
  async (req: Request, _: unknown, next: NextFunction) => {
    try {
      const validated: unknown = await schema.validate(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      next(new BadRequestError("Invalid request body"));
    }
  };
