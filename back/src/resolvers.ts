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
    comments: (parent, _, { dataSources: { db } }) => {
      return db.comment.findMany({
        where: { articleId: parent.id },
        include: {
          author: true,
          dislikes: true,
        },
      });
    },
    dislikes: (parent, _, { dataSources: { db } }) => {
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
      console.log("parent article", parent);
      if (!parent.articleId) return null;
      return db.article.findUnique({
        where: { id: parent.articleId },
        include: {
          author: true,
        },
      });
    },
    comment: (parent, _, { dataSources: { db } }) => {
      console.log("parent comment", parent);
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
    TotalDislikes: async (parent, _, { dataSources: { db } }) => {
      // Trouver tous les articles de l'utilisateur
      const userArticles = await db.article.findMany({
        where: { authorId: parent.id },
        select: { id: true },
      });

      // Obtenir les IDs des articles
      const articleIds = userArticles.map((article: any) => article.id);

      // Compter les dislikes sur ces articles
      const dislikeCount = await db.dislike.count({
        where: {
          articleId: {
            in: articleIds,
          },
        },
      });

      return dislikeCount;
    },

    TotalComments: async (parent, _, { dataSources: { db } }) => {
      // Trouver tous les articles de l'utilisateur
      const userArticles = await db.article.findMany({
        where: { authorId: parent.id },
        select: { id: true },
      });

      // Obtenir les IDs des articles
      const articleIds = userArticles.map((article: any) => article.id);

      // Compter les commentaires sur ces articles
      const commentCount = await db.comment.count({
        where: {
          articleId: {
            in: articleIds,
          },
        },
      });

      return commentCount;
    },
    scoreGlobal: async (parent, _, { dataSources: { db } }) => {
      // Nombre de publications
      const publications = await db.article.count({
        where: { authorId: parent.id },
      });
      // Total des commentaires reçus
      const userArticles = await db.article.findMany({
        where: { authorId: parent.id },
        select: { id: true },
      });
      const articleIds = userArticles.map((article) => article.id);
      const totalCommentsReceived = await db.comment.count({
        where: { articleId: { in: articleIds } },
      });
      // Total des dislikes reçus
      const totalDislikesReceived = await db.dislike.count({
        where: { articleId: { in: articleIds } },
      });
      // Total des commentaires écrits par l'utilisateur
      const totalCommentsWritten = await db.comment.count({
        where: { authorId: parent.id },
      });
      // Total des dislikes donnés par l'utilisateur
      const totalDislikesGiven = await db.dislike.count({
        where: { userId: parent.id },
      });
      // Score global
      return (
        publications * 3 +
        totalCommentsReceived * 1.5 +
        totalDislikesReceived * 1 +
        totalCommentsWritten * 1 +
        totalDislikesGiven * 0.5
      );
    },
  },
  Notification: {
    // Le champ type est maintenant un string, donc on le retourne tel quel
    type: (parent) => parent.type,
  },
};
