import { postsRepository } from "../data/posts";
import { JsonApiHandler } from "../middleware/json-api";
import { FunctionHandler, BodyRequest } from "../my-server";
import { AddPostPayload } from "../types/posts";

export const getAllPosts: JsonApiHandler = async (req, res): Promise<void> => {
  const posts = await postsRepository.getAllPosts();
  res.writeHead(200);
  void res.jsonApi({
    type: "post",
    payload: posts,
  });
};

export const addPost: JsonApiHandler<BodyRequest<AddPostPayload>> = async (
  req,
  res
): Promise<void> => {
  const newPost = await postsRepository.addPost(req.body);
  res.writeHead(201);
  void res.jsonApi({
    type: "post",
    payload: newPost,
  });
};

export const getSinglePost: JsonApiHandler = async (
  req,
  res
): Promise<void> => {
  const id = req.params.id;
  const post = await postsRepository.getSinglePost(id);
  if (post === null) {
    res.writeHead(404);
    res.end("Post with such id was not found");
  } else {
    res.writeHead(200);
    void res.jsonApi({
      type: "post",
      payload: post,
    });
  }
};

export const deleteSinglePost: FunctionHandler = async (
  req,
  res
): Promise<void> => {
  const id = req.params.id;
  await postsRepository.deleteSinglePost(id);
  res.writeHead(204);
  res.end();
};
