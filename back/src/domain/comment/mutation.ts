import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";

// Ajouter un commentaire
export const addComment: NonNullable<MutationResolvers['addComment']> = async (_, { content, userId, articleId }, { dataSources: { db } }) => {
    try {
        const newComment = await db.comment.create({
            data: {
                content,
                authorId: userId,
                articleId
            },
            include: {
                author: true
            }
        });
        return newComment;
    } catch {
        throw new Error('Comment has not been added');
    }
}

// Supprimer un commentaire
export const deleteComment: NonNullable<MutationResolvers['deleteComment']> = async (_, { commentId }, { dataSources: { db } }) => {
    try {
        const comment = await db.comment.delete({
            where: {
                id: commentId
            }
        });

        return {
            code: 200,
            success: true,
            message: `Comment has been deleted`,
        };

    } catch {
        throw new Error('Comment has not been deleted');
    }
}

// Modifier un commentaire
export const updateComment: NonNullable<MutationResolvers['updateComment']> = async (_, { commentId, content }, { dataSources: { db } }) => {
    try {
        const comment = await db.comment.update({
            where: {
                id: commentId
            },
            data: {
                content
            }
        });

        return comment;
    } catch {
        throw new Error('Comment has not been updated');
    }
}

type CommentMutations = WithRequired<MutationResolvers, 'addComment' | 'deleteComment' | 'updateComment'>

export const commentMutations: CommentMutations = {
    addComment,
    deleteComment,
    updateComment,
}