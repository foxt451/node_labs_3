export interface Post {
  id: string;
  title: string;
  text: string;
}

export type AddPostPayload = Omit<Post, "id">;
