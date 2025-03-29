import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";

// Article Dislike
export const deleteArticleDislike: NonNullable<
  MutationResolvers["deleteArticleDislike"]
> = async (_, { articleId, userId }, { dataSources: { db } }) => {
  try {
    await db.dislike.deleteMany({
      where: {
        articleId,
        userId,
      },
    });

    return {
      code: 200,
      success: true,
      message: `Dislike has been deleted`,
    };
  } catch {
    return {
      code: 500,
      success: false,
      message: `Failed to add dislike`,
    };
  }
};

export const addArticleDislike: NonNullable<
  MutationResolvers["addArticleDislike"]
> = async (_, { articleId, userId }, { dataSources: { db } }) => {
  try {
    const dislikeExists = await db.dislike.findFirst({
      where: { userId, articleId },
    });

    if (dislikeExists) {
      console.log("❌ Dislike déjà existant dans la base !");
      return null;
    }

    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    const articleExists = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!articleExists) {
      throw new Error("Article not found");
    }

    const dislike = await db.dislike.create({
      data: {
        userId,
        articleId,
      },
      include: { user: true },
    });

    if (!dislike) {
      throw new Error("Failed to create dislike");
    }

    return dislike;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Comment Dislike
export const deleteCommentDislike: NonNullable<
  MutationResolvers["deleteCommentDislike"]
> = async (_, { commentId, userId }, { dataSources: { db } }) => {
  try {
    await db.dislike.deleteMany({
      where: {
        commentId,
        userId,
      },
    });

    return {
      code: 200,
      success: true,
      message: `Dislike has been deleted`,
    };
  } catch {
    return null;
  }
};

export const addCommentDislike: NonNullable<
  MutationResolvers["addCommentDislike"]
> = async (_, { commentId, userId }, { dataSources: { db } }) => {
  try {
    const dislike = await db.dislike.create({
      data: {
        userId,
        commentId,
      },
      include: {
        user: true,
        comment: true,
      },
    });

    return dislike;
  } catch {
    return null;
  }
};

type DislikeMutations = WithRequired<
  MutationResolvers,
  | "deleteArticleDislike"
  | "deleteCommentDislike"
  | "addArticleDislike"
  | "addCommentDislike"
>;

export const dislikeMutations: DislikeMutations = {
  deleteArticleDislike,
  deleteCommentDislike,
  addArticleDislike,
  addCommentDislike,
};
