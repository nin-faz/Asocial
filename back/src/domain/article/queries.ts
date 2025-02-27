import { QueryResolvers } from "../../types";
import { WithRequired } from "../../utils/mapped-type";
import { findArticles } from "./findArticles.js";
import { findArticleById } from "./findArticleById.js";



type ArticleQueries = WithRequired<QueryResolvers, 'findArticles' | 'findArticleById'>;

export const articleQueries: ArticleQueries = {
    findArticles,
    findArticleById
}