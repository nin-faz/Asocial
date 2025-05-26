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

    interface ArticleWithCounts
      extends Omit<(typeof articles)[number], "_count"> {
      _count: {
        dislikes: number;
        comments: number;
      };
    }

    interface SortedArticle extends ArticleWithCounts {
      TotalDislikes: number;
      TotalComments: number;
    }

    const sortedArticles: SortedArticle[] = (articles as ArticleWithCounts[])
      .map(
        (article): SortedArticle => ({
          ...article,
          TotalDislikes: article._count?.dislikes,
          TotalComments: article._count?.comments,
        })
      )
      .sort((a, b) => {
        const dateA: Date = a.updatedAt
          ? new Date(a.updatedAt)
          : new Date(a.createdAt);
        const dateB: Date = b.updatedAt
          ? new Date(b.updatedAt)
          : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Tri décroissant
      });

    return sortedArticles;
  } catch (error) {
    throw new Error(`Failed to fetch articles : ${error}`);
  }
};
