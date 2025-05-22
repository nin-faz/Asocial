import { MutationResolvers } from "../../types";
import { notifyTelegram } from "../../utils/notifyTelegram.js";

export const createArticle: NonNullable<
  MutationResolvers["createArticle"]
> = async (_, { title, content, imageUrl }, { dataSources: { db }, user }) => {
  try {
    if (!user) {
      return {
        code: 403,
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
