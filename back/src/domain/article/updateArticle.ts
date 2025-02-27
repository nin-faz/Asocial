import { MutationResolvers } from "../../types";

export const updateArticle: NonNullable<MutationResolvers['updateArticle']> = async (_, {id, title, content}, {dataSources: {db}, user}) => {
    try {

        if(!user) {
            return {
                code: 403,
                success: false,
                message: `Unauthorized`,
                article: null
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