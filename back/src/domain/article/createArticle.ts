import { Context } from "../../context";
import { MutationResolvers } from "../../types";

export const createArticle: NonNullable<MutationResolvers['createArticle']> = async (_, {title,content}, {dataSources: {db}, user}: Context) => {
    try {

        console.log("create article user", user)

        if(!user) {
            return {
                code: 403,
                success: false,
                message: `Unauthorized`,
                article: null
            }
        }

        const createdArticle = await db.article.create({
            data: {
                title: title || '',
                content,
                createdAt: new Date(),
                author: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })

        return {
            code: 201,
            success: true,
            message: `Article has been created`,
            article: {
                id: createdArticle.id,
                title: createdArticle.title,
                content: createdArticle.content,
                createdAt: createdArticle.createdAt.toISOString(),
                author: {
                    id: user.id,
                    username: user.username,
                }
            }
        }
    } catch (error) {
        return {
            code: 400,
            message: 'Article has not been created',
            success: false,
            article: null
        }
        
    }
}