import { QueryResolvers } from "../../types";
import { Context } from "../../context";

export const findArticleById: NonNullable<QueryResolvers['findArticleById']> = async (_, {id}, {dataSources: {db}}: Context) => {
    try {
        const article = await db.article.findUnique({
            where: {
                id
            },
            include: {
                author: true,
                comment: {
                    include: {
                        author: true,
                        likes: true
                    }
                },
                likes: true
            }
        })

        if(!article) {
            return null
        }

        return article

    } catch (error) {
        throw new Error(`Failed to fetch articles : ${error}`);
    }
}