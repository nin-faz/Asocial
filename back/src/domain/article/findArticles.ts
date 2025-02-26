import { QueryResolvers } from "../../types";
import { Context } from "../../context";

export const findArticles: NonNullable<QueryResolvers['findArticles']> = async (_, __, {dataSources: {db}}: Context) => {
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
