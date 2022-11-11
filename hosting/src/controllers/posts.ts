import { postsRepository } from "../data/posts";
import { FunctionHandler, JsonFunctionHandler } from "../my-server";
import { AddPostPayload } from "../types/posts";

export const getAllPosts: FunctionHandler = async (req, res): Promise<void> => {
  const posts = await postsRepository.getAllPosts();
  res.writeHead(200);
  res.end(JSON.stringify(posts));
};

export const addPost: JsonFunctionHandler<AddPostPayload> = async (
  req,
  res
): Promise<void> => {
  const newPost = await postsRepository.addPost(req.body);
  res.writeHead(201);
  res.end(JSON.stringify(newPost));
};

export const getSinglePost: FunctionHandler = async (
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
    res.end(JSON.stringify(post));
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
