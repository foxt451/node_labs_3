import { ServerResponse } from "http";
import { Serializer } from "ts-japi";
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

const serializeError = (error: unknown) => {
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

export const errorJsonApi = (
  res: ServerResponse,
  errors: unknown[],
  commonStatus: number = errors[0] instanceof CustomError
    ? errors[0].status
    : 500
): void => {
  res.writeHead(commonStatus);
  res.end(
    JSON.stringify({
      errors: errors.map(serializeError),
    })
  );
};
