import { QueryResolvers } from "../../types";

export const findArticleByMostDisliked: NonNullable<
  QueryResolvers["findArticleByMostDisliked"]
> = async (_, __, { dataSources: { db } }) => {
  try {
    const articles = await db.article.findMany({
      include: {
        author: true,
        dislikes: true,
        comments: true,
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    if (!articles || articles.length === 0) {
      console.log("No articles found with dislikes");
      return [];
    }

    const sortedArticles = articles
      .map((article) => ({
        ...article,
        TotalDislikes: article._count?.dislikes ?? 0,
        TotalComments: article._count?.comments ?? 0,
      }))
      .sort((a, b) => {
        const dislikeA = a.TotalDislikes;
        const dislikeB = b.TotalDislikes;

        if (dislikeB !== dislikeA) {
          return dislikeB - dislikeA; // Tri par dislikes décroissant
        }

        // Si dislikes égaux, tri par date (updatedAt > createdAt)
        const dateA = a.updatedAt
          ? new Date(a.updatedAt)
          : new Date(a.createdAt);
        const dateB = b.updatedAt
          ? new Date(b.updatedAt)
          : new Date(b.createdAt);

        return dateB.getTime() - dateA.getTime(); // Tri décroissant par date
      });

    return sortedArticles;
  } catch (error) {
    console.error("Error in findArticleByMostDisliked:", error);
    throw new Error("Failed to fetch most disliked articles");
  }
};
