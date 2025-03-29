import { QueryResolvers } from "../../types";

export const findArticlesByUser: NonNullable<
  QueryResolvers["findArticlesByUser"]
> = async (_, { userId }, { dataSources: { db } }) => {
  try {
    const articles = await db.article.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: true,
        dislikes: true,
        comments: true,
        _count: { select: { dislikes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return articles.map((article) => ({
      ...article,
      TotalDislikes: article._count.dislikes,
      TotalComments: article._count.comments,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch user's articles: ${error}`);
  }
};
