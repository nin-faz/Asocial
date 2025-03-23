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

export const getDislikesByUserId: NonNullable<
  QueryResolvers["getDislikesByUserId"]
> = async (_, { userId }, { dataSources: { db } }) => {
  try {
    const dislikes = await db.dislike.findMany({
      where: {
        userId,
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

type DislikeQueries = WithRequired<
  QueryResolvers,
  "getDislikesByArticleId" | "getDislikesByUserId" | "getDislikesByCommentId"
>;
export const dislikeQueries: DislikeQueries = {
  getDislikesByArticleId,
  getDislikesByCommentId,
  getDislikesByUserId,
};
