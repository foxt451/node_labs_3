import { ServerResponse } from "http";
import { ErrorSerializer, Serializer } from "ts-japi";
import { PostSerializer } from "@/data/posts/post-serializer";
import { CustomError } from "@/errors";

type ModelType = "post";

const serializers: Record<ModelType, Serializer> = {
  post: PostSerializer,
};

export const jsonApi = async (
  res: ServerResponse,
  data: { type: ModelType; payload: object }
): Promise<void> => {
  const serialized = await serializers[data.type].serialize(data.payload);
  res.end(JSON.stringify(serialized));
};

const standardizeError = (error: unknown) => {
  if (error instanceof CustomError) {
    return {
      status: error.status.toString(),
      detail: error.message,
    };
  }
  return {
    status: "500",
    detail: "Internal server error",
  };
};

const errorSerializer = new ErrorSerializer({
  attributes: {
    status: "status",
    detail: "detail",
  },
});

export const errorJsonApi = (
  res: ServerResponse,
  errors: unknown[],
  commonStatus: number = errors[0] instanceof CustomError
    ? errors[0].status
    : 500
): void => {
  res.writeHead(commonStatus);
  res.end(
    JSON.stringify(errorSerializer.serialize(errors.map(standardizeError)))
  );
};
