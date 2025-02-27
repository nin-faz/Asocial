import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";

// Article Dislike
export const deleteArticleDislike: NonNullable<MutationResolvers['deleteArticleDislike']> = async (_, {articleId, userId}, {dataSources: {db}}) => {
    try {
        await db.dislike.deleteMany({
            where: {
                articleId,
                userId
            }
        })

        return {
            id: '',
            userId,
            articleId: null,
            commentId: null,
        };
    } catch {
        return null;
    }
}

export const addArticleDislike: NonNullable<MutationResolvers['addArticleDislike']> = async (_, {articleId, userId}, {dataSources: {db}}) => {
    try {
        const dislike = await db.dislike.create({
            data: {
                userId,
                articleId
            }
        });

        return dislike;
    } catch {
        return null;
    }
}

// Comment Dislike
export const deleteCommentDislike: NonNullable<MutationResolvers['deleteCommentDislike']> = async (_, {commentId, userId}, {dataSources: {db}}) => {
    try {
        await db.dislike.deleteMany({
            where: {
                commentId,
                userId
            }
        })

        return {
            id: '',
            userId,
            articleId: null,
            commentId
        };
    } catch {
        return null;
    }
}

export const addCommentDislike: NonNullable<MutationResolvers['addCommentDislike']> = async (_, {commentId, userId}, {dataSources: {db}}) => {
    try {
        const dislike = await db.dislike.create({
            data: {
                userId,
                commentId
            }
        });

        return dislike;
    } catch {
        return null;
    }
}

type DislikeMutations = WithRequired<MutationResolvers, 'deleteArticleDislike' | 'deleteCommentDislike' | 'addArticleDislike' | 'addCommentDislike'>

export const dislikeMutations: DislikeMutations = {
    deleteArticleDislike,
    deleteCommentDislike,
    addArticleDislike,
    addCommentDislike
}