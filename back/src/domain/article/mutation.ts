import { MutationResolvers } from "../../types";
import { WithRequired } from "../../utils/mapped-type";
import { createArticle } from "./createArticle.js";
import { deleteArticle } from "./deleteArticle.js";
import { updateArticle } from "./updateArticle.js";

type ArticleMutations = WithRequired<
  MutationResolvers,
  "createArticle" | "deleteArticle" | "updateArticle"
>;

export const articleMutations: ArticleMutations = {
  createArticle,
  deleteArticle,
  updateArticle,
};
