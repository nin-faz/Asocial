import { QueryResolvers } from "../../types";
import { WithRequired } from "../../utils/mapped-type";
import { findArticles } from "./findArticles.js";
import { findArticleById } from "./findArticleById.js";
import { findArticleByMostDisliked } from "./findArticleByMostDisliked.js";
import { findArticlesByUser } from "./findArticlesByUser.js";

type ArticleQueries = WithRequired<
  QueryResolvers,
  | "findArticles"
  | "findArticleById"
  | "findArticleByMostDisliked"
  | "findArticlesByUser"
>;

export const articleQueries: ArticleQueries = {
  findArticles,
  findArticleById,
  findArticleByMostDisliked,
  findArticlesByUser,
};
