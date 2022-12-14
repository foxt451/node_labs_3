import { AddPostPayload } from "@/types/posts";
import * as yup from "yup";
import { SchemaOf } from "yup";

export const addPostPayloadSchema: SchemaOf<AddPostPayload> = yup
  .object()
  .shape({
    title: yup.string().required(),
    text: yup.string().required(),
  });

export const idSchema = yup.object().shape({
  id: yup.string().required(),
});
