import { QueryResolvers } from "../../types";

const DEFAULT_LIMIT = 20;

export const findArticles: NonNullable<QueryResolvers["findArticles"]> = async (
  _,
  { limit = DEFAULT_LIMIT, offset = 0 },
  { dataSources: { db } }
) => {
  try {
    const articles = await db.article.findMany({
      take: limit ?? DEFAULT_LIMIT,
      skip: offset ?? 0,
      orderBy: [
        { updatedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      include: {
        author: true,
        dislikes: { include: { user: { select: { id: true } } } },
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    if (!articles) return [];

    return articles.map((article: any) => ({
      ...article,
      TotalDislikes: article._count?.dislikes,
      TotalComments: article._count?.comments,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch articles : ${error}`);
  }
};
