import { Linker, Serializer } from "ts-japi";
import { ENV } from "@/env/env";
import { Post } from "@/types/posts";

const PostResourceLinker = new Linker(
  (post: Post) => `${ENV.API_BASE_URL}/posts/${post.id}`
);

export const PostSerializer = new Serializer<Post>("post", {
  linkers: {
    resource: PostResourceLinker,
  },
});
