import { MutationResolvers } from "../../types";
import { WithRequired } from "../../utils/mapped-type";
import { createArticle } from "./createArticle.js";
import { deleteArticle } from "./deleteArticle.js";

type ArticleMutations = WithRequired<MutationResolvers, 'createArticle' | 'deleteArticle'>;

export const articleMutations: ArticleMutations = {
  createArticle,
  deleteArticle
}