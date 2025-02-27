import { QueryResolvers } from "../../types";

export const findArticles: NonNullable<QueryResolvers['findArticles']> = async (_, __, {dataSources: {db}}) => {
    try {
        const articles = await db.article.findMany({include: {author: true}})

        if(!articles) {
            return []
        }

        return articles

    } catch (error) {
        throw new Error(`Failed to fetch articles : ${error}`);
    }
}
