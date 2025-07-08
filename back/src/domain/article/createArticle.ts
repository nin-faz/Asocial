import { MutationResolvers } from "../../types";
import { notifyTelegram } from "../../utils/notifyTelegram.js";
import { io } from "../../index.js";
import { sendPushNotificationToUser } from "../../utils/sendPushNotification.js";

export const createArticle: NonNullable<
  MutationResolvers["createArticle"]
> = async (_, { title, content, imageUrl }, { dataSources: { db }, user }) => {
  try {
    if (!user) {
      return {
        code: 401,
        success: false,
        message: `Unauthorized`,
        article: null,
      };
    }

    const createdArticle = await db.article.create({
      data: {
        title: title || "",
        content,
        imageUrl,
        createdAt: new Date(),
        author: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    const formattedDate = createdArticle.createdAt.toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ✅ Envoi d'une notif Telegram pour la création
    const message = [
      `📝 Nouvel article créé par ${user.username}`,
      title && `Titre : ${title}`,
      `Contenu : ${content}`,
      `🕒 Le ${formattedDate}`,
    ]
      .filter(Boolean)
      .join("\n");

    await notifyTelegram(message);

    const mentionText = `${title || ""}\n${content}`;
    const mentionRegex = /@([\w.-]+)/g;
    let match;
    const mentioned = new Set<string>();
    while ((match = mentionRegex.exec(mentionText))) {
      mentioned.add(match[1]);
    }
    for (const username of mentioned) {
      if (username === user.username) continue;
      const mentionedUser = await db.user.findUnique({ where: { username } });
      if (mentionedUser) {
        const notif = await db.notification.create({
          data: {
            type: "mention",
            message: `${user.username} vous a mentionné dans un article`,
            user: { connect: { id: mentionedUser.id } },
            article: { connect: { id: createdArticle.id } },
          },
        });
        io.to(mentionedUser.id).emit("notification", notif);
        // Send push notification
        await sendPushNotificationToUser(mentionedUser.id, {
          title: "Nouvelle mention",
          body: notif.message,
          url: `/publications/${createdArticle.id}`,
        });
      }
    }

    return {
      code: 201,
      success: true,
      message: `Article has been created`,
      article: {
        id: createdArticle.id,
        title: createdArticle.title,
        content: createdArticle.content,
        imageUrl: createdArticle.imageUrl,
        createdAt: createdArticle.createdAt,
        authorId: user.id,
        updatedAt: createdArticle.updatedAt,
        author: {
          id: user.id,
          username: user.username,
        },
      },
    };
  } catch (error) {
    console.error("Error creating article:", error);
    return {
      code: 400,
      message: "Article has not been created",
      success: false,
      article: null,
    };
  }
};
