import { Dislike, Comment, Article } from "@prisma/client";

export type UserModel = {
  id: string;
  username: string;
  articles: [Article];
  comments: [Comment];
  dislikes: [Dislike];
  bio: string;
  createdAt: string;
};

export type DislikeModel = Dislike;
export type CommentModel = Comment;
export type ArticleModel = Article;
