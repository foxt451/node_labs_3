import { AddPostPayload, Post } from "../../types/posts";
import { mockPosts } from "./mock-data";

const getAllPosts = async (): Promise<Post[]> => Promise.resolve(mockPosts);
const addPost = async (post: AddPostPayload): Promise<Post> => {
  const newPost: Post = { ...post, id: (mockPosts.length + 1).toString() };
  mockPosts.push(newPost);
  return Promise.resolve(newPost);
};
const getSinglePost = async (id: string): Promise<Post | null> => {
  const post = mockPosts.find((post) => post.id === id);
  return Promise.resolve(post ?? null);
};
const deleteSinglePost = async (id: string): Promise<void> => {
  const postInd = mockPosts.findIndex((post) => post.id === id);
  if (postInd >= 0) {
    mockPosts.splice(postInd, 1);
  }
  return Promise.resolve();
};

export const postsRepository = {
  getAllPosts,
  addPost,
  getSinglePost,
  deleteSinglePost,
};
