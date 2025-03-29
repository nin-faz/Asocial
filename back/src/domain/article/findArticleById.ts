import { QueryResolvers } from "../../types";

export const findArticleById: NonNullable<
  QueryResolvers["findArticleById"]
> = async (_, { id }, { dataSources: { db } }) => {
  try {
    const article = await db.article.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        dislikes: true,
        comments: true,
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    if (!article) {
      return null;
    }

    return {
      ...article,
      TotalDislikes: article._count.dislikes,
      TotalComments: article._count.comments,
    };
  } catch (error) {
    throw new Error(`Failed to fetch articles : ${error}`);
  }
};
