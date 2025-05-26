import { QueryResolvers } from "../../types";

export const findArticles: NonNullable<QueryResolvers["findArticles"]> = async (
  _,
  { page = 1, limit = 10 },
  { dataSources: { db } }
) => {
  try {
    // Get total count for pagination
    const totalArticles = await db.article.count();
    const totalPages = Math.ceil(totalArticles / limit);
    
    // Calculate offset
    const offset = (page - 1) * limit;

    const articles = await db.article.findMany({
      take: limit,
      skip: offset,
      include: {
        author: true,
        dislikes: true,
        comments: true,
        _count: { select: { dislikes: true, comments: true } },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!articles) {
      return {
        articles: [],
        totalPages: 0,
        currentPage: page,
        totalArticles: 0
      };
    }

    const processedArticles = articles.map((article) => ({
      ...article,
      TotalDislikes: article._count?.dislikes,
      TotalComments: article._count?.comments,
    }));

    return {
      articles: processedArticles,
      totalPages,
      currentPage: page,
      totalArticles
    };
  } catch (error) {
    throw new Error(`Failed to fetch articles : ${error}`);
  }
};