import { MutationResolvers } from "../../types";

export const updateArticle: NonNullable<MutationResolvers['updateArticle']> = async (_, {id, title, content}, {dataSources: {db}, user}) => {
    try {

        if(!user) {
            return {
                code: 403,
                success: false,
                message: `Unauthorized`,
            }
        }

        const existArticle  = await db.article.findFirst({where: {id}});
        if(!existArticle) {
            return {
                code: 404,
                success: false,
                message: `Article not found`,
            }
        }

        if(user.id !== existArticle.authorId) {
            return {
                code: 401,
                success: false,
                message: `You are not the author of this article`,
            }
        }

        const updateData: { title?: string, content?: string, updatedAt: Date } = {
            updatedAt: new Date()
        }

        if(title) {
            updateData.title = title
        }
        if(content) {
            updateData.content = content
        }
        
        await db.article.update({
            where: {
                id
            },
            data: updateData
        })

        return {
            code: 200,
            success: true,
            message: `Article has been updated`
        }
    } catch (error) {
        return {
            code: 400,
            message: 'Article has not been updated',
            success: false,
        }
        
    }
}