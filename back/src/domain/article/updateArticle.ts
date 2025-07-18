import { MutationResolvers } from "../../types";
import { io } from "../../index.js";
import { sendPushNotificationToUser } from "../../utils/sendPushNotification.js";

export const updateArticle: NonNullable<
  MutationResolvers["updateArticle"]
> = async (
  _,
  { id, title, content, imageUrl, videoUrl },
  { dataSources: { db }, user }
) => {
  try {
    if (!user) {
      return {
        code: 403,
        success: false,
        message: `Unauthorized`,
      };
    }

    const existArticle = await db.article.findFirst({ where: { id } });
    if (!existArticle) {
      return {
        code: 404,
        success: false,
        message: `Article not found`,
      };
    }

    if (user.id !== existArticle.authorId) {
      return {
        code: 401,
        success: false,
        message: `You are not the author of this article`,
      };
    }

    const updateData: {
      title?: string;
      content?: string;
      imageUrl?: string | null;
      videoUrl?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (title !== null) {
      updateData.title = title;
    }
    if (content !== null) {
      updateData.content = content;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl;
    }

    console.log("Mise à jour de l'article avec les données:", updateData);

    await db.article.update({
      where: { id },
      data: updateData,
    });
    // Handle mentions in updated article
    const mentionText = `${title !== null ? title : existArticle.title}\n${
      content !== null ? content : existArticle.content
    }`;
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
            article: { connect: { id } },
          },
        });
        io.to(mentionedUser.id).emit("notification", notif);
        // Send push notification
        await sendPushNotificationToUser(mentionedUser.id, {
          title: "Nouvelle mention",
          body: notif.message,
          url: `/publications/${id}`,
        });
      }
    }

    return {
      code: 200,
      success: true,
      message: `Article has been updated`,
    };
  } catch (error) {
    console.error("Error updating article:", error);
    return {
      code: 400,
      message: "Article has not been updated",
      success: false,
    };
  }
};
