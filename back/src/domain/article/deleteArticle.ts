import { MutationResolvers } from "../../types";

export const deleteArticle: NonNullable<
  MutationResolvers["deleteArticle"]
> = async (_, { id }, { dataSources: { db }, user }) => {
  try {
    if (!user) {
      return {
        code: 401,
        success: false,
        message: `You're not connected`,
      };
    }

    const existArticle = await db.article.findFirst({
      where: { id },
      include: { dislikes: true },
    });
    if (!existArticle) {
      return {
        code: 404,
        success: false,
        message: `Article not found`,
      };
    }

    if (user.id !== existArticle.authorId) {
      return {
        code: 401,
        success: false,
        message: `You are not the author of this article`,
      };
    }

    const article = await db.article.findUnique({
      where: {
        id,
      },
    });

    if (!article) {
      return {
        code: 404,
        success: false,
        message: `Article not found`,
      };
    }

    if (article.authorId !== user.id) {
      return {
        code: 403,
        success: false,
        message: `You are not the author of this article`,
      };
    }

    await db.$transaction([
      db.dislike.deleteMany({
        where: { articleId: id },
      }),
      db.article.delete({
        where: { id },
      }),
    ]);

    return {
      code: 200,
      success: true,
      message: `Article has been deleted`,
    };
  } catch (error) {
    return {
      code: 500,
      success: false,
      message: `Article has not been deleted: ${error}`,
    };
  }
};
