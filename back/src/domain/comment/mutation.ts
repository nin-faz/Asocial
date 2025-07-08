import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { notifyTelegram } from "../../utils/notifyTelegram.js";
import { io } from "../../index.js";
import { sendPushNotificationToUser } from "../../utils/sendPushNotification.js";

export const addComment: NonNullable<MutationResolvers["addComment"]> = async (
  _,
  { content, userId, articleId, parentId },
  { dataSources: { db } }
) => {
  try {
    const newComment = await db.comment.create({
      data: {
        content,
        authorId: userId,
        articleId,
        ...(parentId && { parentId }),
      },
      include: {
        author: true,
        parent: true,
      },
    });

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    const formattedDate = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isReply = !!parentId;

    const message = isReply
      ? [
          `↩️ Réponse de ${newComment.author.username} à un commentaire`,
          `Sur l'article de ${article?.author.username} : ${
            article?.title ?? article?.content.slice(0, 30) + "..."
          }`,
          `Contenu de la réponse : ${content}`,
          `🕒 Le ${formattedDate}`,
        ].join("\n")
      : [
          `💬 Nouveau commentaire posté par ${newComment.author.username}`,
          `Sur l'article de ${article?.author.username} : ${
            article?.title ?? article?.content.slice(0, 30) + "..."
          }`,
          `Contenu du commentaire : ${content}`,
          `🕒 Le ${formattedDate}`,
        ].join("\n");

    await notifyTelegram(message);

    // Création de la notification pour l'auteur de l'article si ce n'est pas lui-même
    if (!isReply && article && article.authorId !== userId) {
      const articleLabel =
        article.title && article.title.trim().length > 0
          ? article.title
          : article.content
          ? article.content.slice(0, 30) + "..."
          : "";
      const notif = await db.notification.create({
        data: {
          type: "COMMENT",
          message: `${
            newComment.author.username
          } a commenté votre publication (${articleLabel}) : "${
            newComment.content.length > 15
              ? newComment.content.slice(0, 15) + "..."
              : newComment.content
          }"`,
          userId: article.authorId,
          articleId: article.id,
          commentId: newComment.id,
        },
      });
      io.to(article.authorId).emit("notification", { type: "COMMENT" });
      // --- Push Web ---
      await sendPushNotificationToUser(article.authorId, {
        title: "Nouveau commentaire",
        body: notif.message,
        url: `/publications/${article.id}${
          newComment.id ? `?commentId=${newComment.id}` : ""
        }`,
      });
    }

    // Création de la notification pour l'auteur du commentaire parent si ce n'est pas lui-même
    if (isReply && newComment.parent && newComment.parent.authorId !== userId) {
      const articleLabel =
        article && article.title && article.title.trim().length > 0
          ? article.title
          : article && article.content
          ? article.content.slice(0, 30) + "..."
          : "";
      const notif = await db.notification.create({
        data: {
          type: "REPLY",
          message: `${
            newComment.author.username
          } a répondu à votre commentaire sous (${articleLabel}) : "${
            newComment.content.length > 15
              ? newComment.content.slice(0, 15) + "..."
              : newComment.content
          }"`,
          userId: newComment.parent.authorId,
          articleId: article?.id,
          commentId: newComment.parent.id,
        },
      });
      io.to(newComment.parent.authorId).emit("notification", { type: "REPLY" });
      // --- Push Web ---
      await sendPushNotificationToUser(newComment.parent.authorId, {
        title: "Nouvelle réponse",
        body: notif.message,
        url: `/publications/${article?.id}?commentId=${newComment.parent.id}`,
      });
    }

    // Notifier aussi l'auteur de l'article lors d'une réponse à un commentaire (sauf si c'est lui-même ou l'auteur du commentaire parent)
    if (
      isReply &&
      article &&
      article.authorId !== userId &&
      (!newComment.parent || article.authorId !== newComment.parent.authorId)
    ) {
      const articleLabel =
        article.title && article.title.trim().length > 0
          ? article.title
          : article.content
          ? article.content.slice(0, 30) + "..."
          : "";
      const notif = await db.notification.create({
        data: {
          type: "REPLY",
          message: `${
            newComment.author.username
          } a répondu à un commentaire sous votre publication (${articleLabel}) : "${
            newComment.content.length > 15
              ? newComment.content.slice(0, 15) + "..."
              : newComment.content
          }"`,
          userId: article.authorId,
          articleId: article.id,
          commentId: newComment.id,
        },
      });
      io.to(article.authorId).emit("notification", { type: "REPLY" });
      // --- Push Web ---
      await sendPushNotificationToUser(article.authorId, {
        title: "Nouvelle réponse",
        body: notif.message,
        url: `/publications/${article.id}?commentId=${newComment.id}`,
      });
    }

    const mentionRegex = /@([\w.-]+)/g;
    let mentionMatch;
    const mentionSet = new Set<string>();
    while ((mentionMatch = mentionRegex.exec(content))) {
      mentionSet.add(mentionMatch[1]);
    }
    for (const username of mentionSet) {
      if (username === newComment.author.username) continue;
      const mentionedUser = await db.user.findUnique({ where: { username } });
      if (mentionedUser) {
        const mentionNotif = await db.notification.create({
          data: {
            type: "mention",
            message: `${newComment.author.username} vous a mentionné dans un commentaire`,
            user: { connect: { id: mentionedUser.id } },
            article: articleId ? { connect: { id: articleId } } : undefined,
            comment: { connect: { id: newComment.id } },
          },
        });
        io.to(mentionedUser.id).emit("notification", mentionNotif);
        await sendPushNotificationToUser(mentionedUser.id, {
          title: "Nouvelle mention",
          body: mentionNotif.message,
          url: `/publications/${articleId}?commentId=${newComment.id}`,
        });
      }
    }

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
        code: 401,
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

    // Supprimer les notifications liées à ce commentaire (réponse, dislike, etc.)
    await db.notification.deleteMany({
      where: {
        commentId: commentId,
      },
    });

    // Supprimer aussi les notifications dont le champ replyId (si tu utilises un champ replyId) ou commentId pointe vers ce commentaire comme réponse
    await db.notification.deleteMany({
      where: {
        // notification liée à une réponse à ce commentaire
        type: "REPLY",
        commentId: commentId,
      },
    });

    // Supprimer les notifications de type REPLY liées à une réponse supprimée (notification envoyée à l'auteur du parent)
    if (existComment.parentId) {
      // On cherche le parent pour récupérer son auteur
      const parent = await db.comment.findUnique({
        where: { id: existComment.parentId },
      });
      const authorUser = await db.user.findUnique({
        where: { id: existComment.authorId },
      });
      if (parent && authorUser) {
        await db.notification.deleteMany({
          where: {
            type: "REPLY",
            commentId: existComment.parentId,
            userId: parent.authorId,
            message: { contains: authorUser.username },
          },
        });
      }
    }

    // Supprimer la notification REPLY envoyée à l'auteur de l'article lors d'une réponse à un commentaire sous sa publication
    if (existComment.parentId && existComment.articleId) {
      // On cherche l'article pour récupérer son auteur
      const article = await db.article.findUnique({
        where: { id: existComment.articleId },
      });
      const authorUser = await db.user.findUnique({
        where: { id: existComment.authorId },
      });
      if (article && authorUser) {
        await db.notification.deleteMany({
          where: {
            type: "REPLY",
            articleId: existComment.articleId,
            userId: article.authorId,
            message: { contains: authorUser.username },
          },
        });
      }
    }

    // Supprimer la notification COMMENT envoyée à l'auteur de la publication lors de la suppression d'un commentaire sous sa publication
    if (!existComment.parentId && existComment.articleId) {
      // On cherche l'article pour récupérer son auteur
      const article = await db.article.findUnique({
        where: { id: existComment.articleId },
      });
      const authorUser = await db.user.findUnique({
        where: { id: existComment.authorId },
      });
      if (article && authorUser) {
        await db.notification.deleteMany({
          where: {
            type: "COMMENT",
            articleId: existComment.articleId,
            userId: article.authorId,
            message: { contains: authorUser.username },
          },
        });
      }
    }

    // Après suppression des notifications COMMENT et REPLY, notifie les destinataires
    if (existComment.parentId) {
      const parent = await db.comment.findUnique({
        where: { id: existComment.parentId },
      });
      if (parent && parent.authorId !== user.id) {
        io.to(parent.authorId).emit("notification", { type: "REPLY_REMOVED" });
      }
    }
    if (existComment.articleId) {
      const article = await db.article.findUnique({
        where: { id: existComment.articleId },
      });
      if (article && article.authorId !== user.id) {
        io.to(article.authorId).emit("notification", {
          type: existComment.parentId ? "REPLY_REMOVED" : "COMMENT_REMOVED",
        });
      }
    }

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

    const mentionRegex = /@([\w.-]+)/g;
    let mentionMatch;
    const mentionSet = new Set<string>();
    while ((mentionMatch = mentionRegex.exec(content))) {
      mentionSet.add(mentionMatch[1]);
    }
    for (const username of mentionSet) {
      if (username === user.username) continue;
      const mentionedUser = await db.user.findUnique({ where: { username } });
      if (mentionedUser) {
        const mentionNotif = await db.notification.create({
          data: {
            type: "mention",
            message: `${user.username} vous a mentionné dans un commentaire`,
            user: { connect: { id: mentionedUser.id } },
            comment: { connect: { id: commentId } },
            article: existComment?.articleId
              ? { connect: { id: existComment.articleId } }
              : undefined,
          },
        });
        io.to(mentionedUser.id).emit("notification", mentionNotif);
        await sendPushNotificationToUser(mentionedUser.id, {
          title: "Nouvelle mention",
          body: mentionNotif.message,
          url: `/publications/${existComment?.articleId}?commentId=${commentId}`,
        });
      }
    }

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

// Helper pour récupérer le username à partir de l'id
async function parentIdToUsername(userId: string, db: any): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId } });
  return user?.username || "";
}
