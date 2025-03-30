import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";

export const addComment: NonNullable<MutationResolvers["addComment"]> = async (
  _,
  { content, userId, articleId },
  { dataSources: { db } }
) => {
  try {
    const newComment = await db.comment.create({
      data: {
        content,
        authorId: userId,
        articleId,
      },
      include: {
        author: true,
      },
    });
    return newComment;
  } catch {
    throw new Error("Comment has not been added");
  }
};

export const deleteComment: NonNullable<
  MutationResolvers["deleteComment"]
> = async (_, { commentId }, { dataSources: { db }, user }) => {
  try {
    if (!user) {
      return {
        code: 403,
        success: false,
        message: `Unauthorized`,
      };
    }

    const existComment = await db.comment.findFirst({
      where: { id: commentId },
    });
    if (!existComment) {
      return {
        code: 404,
        success: false,
        message: `Comment not found`,
      };
    }

    if (user.id !== existComment.authorId) {
      return {
        code: 401,
        success: false,
        message: `You are not the author of this comment`,
      };
    }

    await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return {
      code: 200,
      success: true,
      message: `Comment has been deleted`,
    };
  } catch {
    throw new Error("Comment has not been deleted");
  }
};

export const updateComment: NonNullable<
  MutationResolvers["updateComment"]
> = async (_, { commentId, content }, { dataSources: { db }, user }) => {
  try {
    if (!user) {
      return {
        code: 403,
        success: false,
        message: `Unauthorized`,
      };
    }

    const existComment = await db.comment.findFirst({
      where: { id: commentId },
    });
    if (!existComment) {
      return {
        code: 404,
        success: false,
        message: `Comment not found`,
      };
    }

    if (user.id !== existComment.authorId) {
      return {
        code: 401,
        success: false,
        message: `You are not the author of this comment`,
      };
    }

    await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return {
      code: 214,
      success: true,
      message: `update Succeded`,
    };
  } catch {
    throw new Error("Comment has not been updated");
  }
};

type CommentMutations = WithRequired<
  MutationResolvers,
  "addComment" | "deleteComment" | "updateComment"
>;

export const commentMutations: CommentMutations = {
  addComment,
  deleteComment,
  updateComment,
};
