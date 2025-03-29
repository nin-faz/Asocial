import { QueryResolvers } from "../../types";
import { WithRequired } from "../../utils/mapped-type";

export const getDislikesByArticleId: NonNullable<
  QueryResolvers["getDislikesByArticleId"]
> = async (_, { articleId }, { dataSources: { db } }) => {
  try {
    const dislikes = await db.dislike.findMany({
      where: {
        articleId,
      },
      include: {
        user: true,
      },
    });
    return dislikes;
  } catch {
    return null;
  }
};

export const getDislikesByCommentId: NonNullable<
  QueryResolvers["getDislikesByCommentId"]
> = async (_, { commentId }, { dataSources: { db } }) => {
  try {
    const dislikes = await db.dislike.findMany({
      where: {
        commentId,
      },
      include: {
        user: true,
      },
    });
    return dislikes;
  } catch {
    return null;
  }
};

export const getDislikesByUserIdForArticles: NonNullable<
  QueryResolvers["getDislikesByUserIdForArticles"]
> = async (_, { userId }, { dataSources: { db } }) => {
  try {
    const dislikes = await db.dislike.findMany({
      where: {
        userId,
        articleId: { not: null },
      },
      include: {
        article: true,
        user: true,
      },
    });
    return dislikes;
  } catch {
    return null;
  }
};

export const getDislikesByUserIdForComments: NonNullable<
  QueryResolvers["getDislikesByUserIdForComments"]
> = async (_, { userId }, { dataSources: { db } }) => {
  try {
    const dislikes = await db.dislike.findMany({
      where: {
        userId,
        commentId: { not: null },
      },
      include: {
        comment: true,
        user: true,
      },
    });
    return dislikes;
  } catch {
    return null;
  }
};

type DislikeQueries = WithRequired<
  QueryResolvers,
  | "getDislikesByArticleId"
  | "getDislikesByCommentId"
  | "getDislikesByUserIdForArticles"
  | "getDislikesByUserIdForComments"
>;
export const dislikeQueries: DislikeQueries = {
  getDislikesByArticleId,
  getDislikesByCommentId,
  getDislikesByUserIdForArticles,
  getDislikesByUserIdForComments,
};
