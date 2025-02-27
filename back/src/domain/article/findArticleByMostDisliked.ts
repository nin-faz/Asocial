import { QueryResolvers } from "../../types";

export const findArticleByMostDisliked: NonNullable<QueryResolvers['findArticleByMostDisliked']> = async (_, __, {dataSources: {db}}) => {
    try {
        const articles = await db.article.findMany({
            include: {
                author: true,
                dislikes: true,
                _count: {
                    select: {
                        dislikes: true
                    }
                }
            },
            orderBy: [{
                dislikes: {
                    _count: 'desc'
                }
            }]
        });

        if (!articles || articles.length === 0) {
            console.log('No articles found with dislikes');
            return [];
        }

        return articles;
    } catch (error) {
        console.error('Error in findArticleByMostDisliked:', error);
        throw new Error('Failed to fetch most disliked articles');
    }
}