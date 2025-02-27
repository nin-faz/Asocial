import { QueryResolvers } from "../../types";

export const findArticles: NonNullable<QueryResolvers['findArticles']> = async (_, __, {dataSources: {db}}) => {
    try {
        const articles = await db.article.findMany({
            include: {
                author: true,
                _count: { select: { dislikes: true }}
            },
        })

        if(!articles) {
            return []
        }

        return articles.map(article => ({
            ...article,
            NbOfDislikes : article._count.dislikes
        }));

    } catch (error) {
        throw new Error(`Failed to fetch articles : ${error}`);
    }
}
