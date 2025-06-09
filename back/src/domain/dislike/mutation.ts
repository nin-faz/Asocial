import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { io } from "../../index.js";

// Article Dislike
export const deleteArticleDislike: NonNullable<
  MutationResolvers["deleteArticleDislike"]
> = async (_, { articleId, userId }, { dataSources: { db } }) => {
  try {
    await db.dislike.deleteMany({
      where: {
        articleId,
        userId,
      },
    });

    // Supprimer la notification associée à ce dislike d'article
    await db.notification.deleteMany({
      where: {
        articleId: articleId,
        type: "DISLIKE",
        userId: (
          await db.article.findUnique({ where: { id: articleId } })
        )?.authorId,
      },
    });
    // --- Notif temps réel suppression ---
    const article = await db.article.findUnique({ where: { id: articleId } });
    if (article && article.authorId !== userId) {
      io.to(article.authorId).emit("notification", { type: "DISLIKE_REMOVED" });
    }

    return {
      code: 200,
      success: true,
      message: `Dislike has been deleted`,
    };
  } catch {
    return {
      code: 500,
      success: false,
      message: `Failed to add dislike`,
    };
  }
};

export const addArticleDislike: NonNullable<
  MutationResolvers["addArticleDislike"]
> = async (_, { articleId, userId }, { dataSources: { db } }) => {
  try {
    const dislikeExists = await db.dislike.findFirst({
      where: { userId, articleId },
    });

    if (dislikeExists) {
      console.log("❌ Dislike déjà existant dans la base !");
      return null;
    }

    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    const articleExists = await db.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!articleExists) {
      throw new Error("Article not found");
    }

    // Création du dislike
    const dislike = await db.dislike.create({
      data: {
        userId,
        articleId,
      },
      include: { user: true },
    });

    // Création de la notification pour l'auteur de l'article (sauf si self-dislike)
    if (articleExists.authorId !== userId) {
      await db.notification.create({
        data: {
          type: "DISLIKE",
          message: `${userExists.username} a disliké votre publication : ${
            articleExists.title || articleExists.content.slice(0, 30) + "..."
          }`,
          userId: articleExists.authorId,
          articleId: articleExists.id,
        },
      });
      // --- Notif temps réel ---
      io.to(articleExists.authorId).emit("notification", { type: "DISLIKE" });
    }

    return dislike;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Comment Dislike
export const deleteCommentDislike: NonNullable<
  MutationResolvers["deleteCommentDislike"]
> = async (_, { commentId, userId }, { dataSources: { db } }) => {
  try {
    await db.dislike.deleteMany({
      where: {
        commentId,
        userId,
      },
    });

    // Supprimer la notification associée à ce dislike de commentaire
    await db.notification.deleteMany({
      where: {
        commentId: commentId,
        type: "DISLIKE",
        userId: (
          await db.comment.findUnique({ where: { id: commentId } })
        )?.authorId,
      },
    });
    // --- Notif temps réel suppression ---
    const comment = await db.comment.findUnique({ where: { id: commentId } });
    if (comment && comment.authorId !== userId) {
      io.to(comment.authorId).emit("notification", { type: "DISLIKE_REMOVED" });
    }

    return {
      code: 200,
      success: true,
      message: `Dislike has been deleted`,
    };
  } catch {
    return null;
  }
};

export const addCommentDislike: NonNullable<
  MutationResolvers["addCommentDislike"]
> = async (_, { commentId, userId }, { dataSources: { db } }) => {
  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });
    if (!comment) throw new Error("Comment not found");

    const dislike = await db.dislike.create({
      data: {
        userId,
        commentId,
      },
      include: {
        user: true,
        comment: true,
      },
    });

    // Création de la notification pour l'auteur du commentaire (sauf si self-dislike)
    if (comment.authorId !== userId) {
      await db.notification.create({
        data: {
          type: "DISLIKE",
          message: `${dislike.user.username} a disliké votre commentaire : ${
            comment.content.slice(0, 30) + "..."
          }`,
          userId: comment.authorId,
          commentId: comment.id,
          articleId: comment.articleId, // <-- Ajout pour navigation front
        },
      });
      // --- Notif temps réel ---
      io.to(comment.authorId).emit("notification", { type: "DISLIKE" });
    }

    return dislike;
  } catch (error) {
    console.error(error);
    return null;
  }
};

type DislikeMutations = WithRequired<
  MutationResolvers,
  | "deleteArticleDislike"
  | "deleteCommentDislike"
  | "addArticleDislike"
  | "addCommentDislike"
>;

export const dislikeMutations: DislikeMutations = {
  deleteArticleDislike,
  deleteCommentDislike,
  addArticleDislike,
  addCommentDislike,
};
