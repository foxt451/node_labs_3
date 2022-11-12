import { ServerResponse } from "http";
import { Serializer } from "ts-japi";
import { PostSerializer } from "../data/posts/post-serializer";
import { FunctionHandler, Request } from "../my-server";

type ModelType = "post";

const serializers: Record<ModelType, Serializer> = {
  post: PostSerializer,
};

export type JsonApiResponse<T extends ServerResponse = ServerResponse> = T & {
  // function to send response
  jsonApi: (data: { type: ModelType; payload: object }) => Promise<void>;
};

export type JsonApiHandler<
  R extends Request = Request,
  S extends ServerResponse = ServerResponse
> = FunctionHandler<R, JsonApiResponse<S>>;

export const jsonApi: JsonApiHandler = (_, res, next) => {
  res.jsonApi = async (data) => {
    console.log(data);

    const serialized = await serializers[data.type].serialize(data.payload);
    res.end(JSON.stringify(serialized));
  };
  next();
};
