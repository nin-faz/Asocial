import { QueryResolvers } from "../../types";

export const findArticleById: NonNullable<QueryResolvers['findArticleById']> = async (_, {id}, {dataSources: {db}}) => {
    try {
        const article = await db.article.findUnique({
            where: {
                id
            },
            include: {
                author: true,
                _count: { select: { dislikes: true }}
            }
        })

        if(!article) {
            return null
        }

        return {
            ...article,
            NbOfDislikes: article._count.dislikes 
        };

    } catch (error) {
        throw new Error(`Failed to fetch articles : ${error}`);
    }
}