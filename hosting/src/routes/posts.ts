import {
  addPost,
  deleteSinglePost,
  getAllPosts,
  getSinglePost,
} from "../controllers/posts";
import { MyServer } from "../my-server";

export const postsApp = new MyServer();

postsApp.addHandler("GET", "/", getAllPosts);
postsApp.addHandler("POST", "/", addPost);
postsApp.addHandler("GET", "/:id", getSinglePost);
postsApp.addHandler("DELETE", "/:id", deleteSinglePost);
