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
        comments: true,
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    if (!articles) {
      return [];
    }

    const sortedArticles = articles
      .map((article: any) => ({
        ...article,
        TotalDislikes: article._count?.dislikes,
        TotalComments: article._count?.comments,
      }))
      .sort((a: any, b: any) => {
        const dateA = a.updatedAt
          ? new Date(a.updatedAt)
          : new Date(a.createdAt);
        const dateB = b.updatedAt
          ? new Date(b.updatedAt)
          : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Tri décroissant
      });

    return sortedArticles;
  } catch (error) {
    throw new Error(`Failed to fetch articles : ${error}`);
  }
};
