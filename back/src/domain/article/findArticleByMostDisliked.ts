import { QueryResolvers } from "../../types";

const DEFAULT_LIMIT = 20;

export const findArticleByMostDisliked: NonNullable<
  QueryResolvers["findArticleByMostDisliked"]
> = async (_, { limit = DEFAULT_LIMIT, offset = 0 }, { dataSources: { db } }) => {
  try {
    const articles = await db.article.findMany({
      take: limit ?? DEFAULT_LIMIT,
      skip: offset ?? 0,
      orderBy: [
        { dislikes: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      include: {
        author: true,
        dislikes: { include: { user: { select: { id: true } } } },
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    if (!articles || articles.length === 0) return [];

    return articles.map((article: any) => ({
      ...article,
      TotalDislikes: article._count?.dislikes ?? 0,
      TotalComments: article._count?.comments ?? 0,
    }));
  } catch (error) {
    console.error("Error in findArticleByMostDisliked:", error);
    throw new Error("Failed to fetch most disliked articles");
  }
};
