import {
  Dislike,
  Comment,
  Article,
  PasswordResetRequest,
  Notification,
} from "@prisma/client";

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
export type PasswordResetRequestModel = PasswordResetRequest;
export type NotificationModel = Notification;
