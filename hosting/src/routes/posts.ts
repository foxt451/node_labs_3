import {
  addPost,
  deleteSinglePost,
  getAllPosts,
  getSinglePost,
} from "@/controllers/posts";
import {
  addPostPayloadSchema,
  idSchema,
} from "@/controllers/yup-schemas/posts";
import { yupBodyValidationMiddleware } from "@/middleware/yup-body-validator";
import { yupParamsValidationMiddleware } from "@/middleware/yup-params-validator";
import { MyServer } from "@/my-server";

export const postsApp = new MyServer();

postsApp.addHandler("GET", "/", getAllPosts);
postsApp.addHandler(
  "POST",
  "/",
  yupBodyValidationMiddleware(addPostPayloadSchema),
  addPost
);
postsApp.addHandler(
  "GET",
  "/:id",
  yupParamsValidationMiddleware(idSchema),
  getSinglePost
);
postsApp.addHandler(
  "DELETE",
  "/:id",
  yupParamsValidationMiddleware(idSchema),
  deleteSinglePost
);
