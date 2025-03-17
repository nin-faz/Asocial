import { QueryResolvers } from "../../types";

export const findArticles: NonNullable<QueryResolvers["findArticles"]> = async (
  _,
  __,
  { dataSources: { db } }
) => {
  try {
    const articles = await db.article.findMany({
      include: {
        author: true,
        dislikes: true,
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    if (!articles) {
      return [];
    }

    return articles.map((article) => ({
      ...article,
      TotalDislikes: article._count?.dislikes,
      TotalComments: article._count?.comments,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch articles : ${error}`);
  }
};
