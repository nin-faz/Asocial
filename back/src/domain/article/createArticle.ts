import { MutationResolvers } from "../../types";
import { notifyTelegram } from "../../utils/notifyTelegram.js";
import { io } from "../../index.js";
import { sendPushNotificationToUser } from "../../utils/sendPushNotification.js";

const ALLOWED_IMAGE_HOSTS = ["i.ibb.co", "res.cloudinary.com"];
const ALLOWED_VIDEO_HOSTS = ["res.cloudinary.com", "cirunonxykzinzlkwpwj.supabase.co"];

function isAllowedUrl(url: string | null | undefined, allowedHosts: string[]): boolean {
  if (!url) return true;
  try {
    const { hostname } = new URL(url);
    return allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export const createArticle: NonNullable<
  MutationResolvers["createArticle"]
> = async (
  _,
  { title, content, imageUrl, videoUrl },
  { dataSources: { db }, user },
) => {
  try {
    if (!user) {
      return {
        code: 401,
        success: false,
        message: `Unauthorized`,
        article: null,
      };
    }

    if (!isAllowedUrl(imageUrl, ALLOWED_IMAGE_HOSTS)) {
      return { code: 400, success: false, message: "imageUrl invalide", article: null };
    }
    if (!isAllowedUrl(videoUrl, ALLOWED_VIDEO_HOSTS)) {
      return { code: 400, success: false, message: "videoUrl invalide", article: null };
    }

    const createdArticle = await db.article.create({
      data: {
        title: title || "",
        content,
        imageUrl,
        videoUrl,
        createdAt: new Date(),
        author: { connect: { id: user.id } },
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

    // Fetch l'article complet avec tous les includes
    const fullArticle = await db.article.findUnique({
      where: { id: createdArticle.id },
      include: {
        author: true,
        dislikes: { include: { user: { select: { id: true } } } },
        _count: { select: { dislikes: true, comments: true } },
      },
    });

    return {
      code: 201,
      success: true,
      message: `Article has been created`,
      article: fullArticle
        ? {
            id: fullArticle.id,
            title: fullArticle.title,
            content: fullArticle.content,
            imageUrl: fullArticle.imageUrl,
            videoUrl: fullArticle.videoUrl,
            authorId: fullArticle.authorId,
            author: fullArticle.author,
            dislikes: fullArticle.dislikes as any,
            TotalDislikes: fullArticle._count?.dislikes,
            TotalComments: fullArticle._count?.comments,
            createdAt: fullArticle.createdAt,
            updatedAt: fullArticle.updatedAt,
          }
        : null,
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
