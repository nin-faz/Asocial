import { dislikeMutations } from "./domain/dislike/mutation.js";
import { userMutations } from "./domain/user/mutation.js";
import { articleMutations } from "./domain/article/mutation.js";
import { userQueries } from "./domain/user/queries.js";
import { Resolvers } from "./types.js";
import { articleQueries } from "./domain/article/queries.js";
import { commentQueries } from "./domain/comment/queries.js";
import { commentMutations } from "./domain/comment/mutation.js";
import { dislikeQueries } from "./domain/dislike/queries.js";
import { resetPasswordWithToken } from "./domain/user/resetPasswordWithToken.js";
import { notificationQueries } from "./domain/notification/queries.js";
import { notificationMutations } from "./domain/notification/mutation.js";

export const resolvers: Resolvers = {
  Query: {
    ...userQueries,
    ...articleQueries,
    ...commentQueries,
    ...dislikeQueries,
    ...notificationQueries,
  },
  Mutation: {
    ...userMutations,
    resetPasswordWithToken,
    ...dislikeMutations,
    ...articleMutations,
    ...commentMutations,
    ...notificationMutations,
  },

  Article: {
    comments: (parent: any, _, { dataSources: { db } }) => {
      if (Array.isArray(parent.comments)) return parent.comments;
      return db.comment.findMany({
        where: { articleId: parent.id },
        include: { author: true, dislikes: true },
      });
    },
    dislikes: (parent: any, _, { dataSources: { db } }) => {
      if (Array.isArray(parent.dislikes)) return parent.dislikes;
      return db.dislike.findMany({
        where: { articleId: parent.id },
      });
    },
  },
  Comment: {
    dislikes: (parent, _, { dataSources: { db } }) => {
      return db.dislike.findMany({
        where: { commentId: parent.id },
      });
    },
    parent: (parent, _, { dataSources: { db } }) => {
      if (!parent.parentId) return null;
      return db.comment.findUnique({
        where: { id: parent.parentId },
        include: {
          author: true,
        },
      });
    },
    replies: (parent, _, { dataSources: { db } }) => {
      return db.comment.findMany({
        where: { parentId: parent.id },
        include: {
          author: true,
          dislikes: true,
        },
      });
    },

    isReply: (parent) => {
      return parent.parentId !== null;
    },
  },
  Dislike: {
    article: (parent, _, { dataSources: { db } }) => {
      if (!parent.articleId) return null;
      return db.article.findUnique({
        where: { id: parent.articleId },
        include: {
          author: true,
        },
      });
    },
    comment: (parent, _, { dataSources: { db } }) => {
      if (!parent.commentId) return null;
      return db.comment.findUnique({
        where: { id: parent.commentId },
        include: {
          author: true,
        },
      });
    },
  },
  UserSummary: {
    TotalDislikes: (parent: any) => parent.TotalDislikes ?? 0,
    TotalComments: (parent: any) => parent.TotalComments ?? 0,
    scoreGlobal: (parent: any) => parent.scoreGlobal ?? 0,
  },
  Notification: {
    // Le champ type est maintenant un string, donc on le retourne tel quel
    type: (parent) => parent.type,
  },
};
