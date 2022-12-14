import { NotFoundError } from "@/errors";
import { errorJsonApi, jsonApi } from "@/helpers/json-api";
import { Request } from "@/types/server";
import { ServerResponse } from "http";
import { postsRepository } from "../data/posts";
import { AddPostPayload } from "../types/posts";

export const getAllPosts = async (
  req: Request,
  res: ServerResponse
): Promise<void> => {
  const posts = await postsRepository.getAllPosts();
  res.writeHead(200);
  await jsonApi(res, {
    type: "post",
    payload: posts,
  });
};

export const addPost = async (
  req: Request<AddPostPayload>,
  res: ServerResponse
): Promise<void> => {
  const newPost = await postsRepository.addPost(req.body);
  res.writeHead(201);
  await jsonApi(res, {
    type: "post",
    payload: newPost,
  });
};

export const getSinglePost = async (
  req: Request,
  res: ServerResponse
): Promise<void> => {
  const id = req.params.id;
  const post = await postsRepository.getSinglePost(id);
  if (post === null) {
    errorJsonApi(res, [new NotFoundError("Post with such id was not found")]);
    return;
  }
  res.writeHead(200);
  await jsonApi(res, {
    type: "post",
    payload: post,
  });
};

export const deleteSinglePost = async (
  req: Request,
  res: ServerResponse
): Promise<void> => {
  const id = req.params.id;
  const deletedPost = await postsRepository.deleteSinglePost(id);
  if (!deletedPost) {
    errorJsonApi(res, [new NotFoundError("Post with such id was not found")]);
    return;
  }
  res.writeHead(200);
  await jsonApi(res, {
    type: "post",
    payload: deletedPost,
  });
};
