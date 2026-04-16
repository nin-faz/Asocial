import { MutationResolvers } from "../../types.js";
import { io } from "../../index.js";
import { sendPushNotificationToUser } from "../../utils/sendPushNotification.js";

type BubbleMutations = Pick<
  MutationResolvers,
  "createBubble" | "addMessageToBubble" | "deleteBubble"
>;

const transformUser = (user: any) => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
});

const transformMessage = (msg: any) => ({
  ...msg,
  createdAt: msg.createdAt.toISOString(),
  author: transformUser(msg.author),
});

const transformBubble = (bubble: any) => ({
  ...bubble,
  createdAt: bubble.createdAt.toISOString(),
  updatedAt: bubble.updatedAt.toISOString(),
  author: transformUser(bubble.author),
  messages: bubble.messages?.map(transformMessage) || [],
});

export const bubbleMutations: BubbleMutations = {
  createBubble: async (_, { title, isAnonymous }, { dataSources: { db }, user }) => {
    if (!user) {
      return {
        code: 401,
        success: false,
        message: "Vous devez être connecté",
        bubble: null,
      };
    }

    if (!title?.trim()) {
      return {
        code: 400,
        success: false,
        message: "Le titre est requis",
        bubble: null,
      };
    }

    const bubble = await db.bubble.create({
      data: {
        title: title.trim(),
        authorId: user.id,
        isAnonymous: isAnonymous ?? false,
      },
      include: {
        author: true,
        messages: true,
      },
    });

    return {
      code: 201,
      success: true,
      message: "Bulle créée avec succès",
      bubble: transformBubble(bubble),
    };
  },

  addMessageToBubble: async (
    _,
    { bubbleId, content, isAnonymous },
    { dataSources: { db }, user },
  ) => {
    if (!user) {
      throw new Error("Vous devez être connecté");
    }

    if (!content?.trim()) {
      throw new Error("Le contenu du message est requis");
    }

    // Vérifier que la bulle existe
    const bubble = await db.bubble.findUnique({
      where: { id: bubbleId },
    });

    if (!bubble) {
      throw new Error("Bulle non trouvée");
    }

    const message = await db.bubbleMessage.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        bubbleId,
        isAnonymous: isAnonymous ?? false,
      },
      include: { author: true },
    });

    // Notifier le propriétaire de la bulle (sauf s'il est l'auteur du message)
    if (bubble.authorId !== user.id) {
      const senderName = isAnonymous ? "Quelqu'un" : message.author.username;
      const notif = await db.notification.create({
        data: {
          type: "BUBBLE_MESSAGE",
          message: `${senderName} a répondu dans votre bulle "${bubble.title.length > 30 ? bubble.title.slice(0, 30) + "..." : bubble.title}"`,
          userId: bubble.authorId,
          bubbleId: bubble.id,
        },
      });
      io.to(bubble.authorId).emit("notification", { type: "BUBBLE_MESSAGE" });
      await sendPushNotificationToUser(bubble.authorId, {
        title: "Nouveau message dans votre bulle",
        body: notif.message,
        url: `/bubbles/${bubble.id}`,
      });
    }

    return transformMessage(message);
  },

  deleteBubble: async (_, { id }, { dataSources: { db }, user }) => {
    if (!user) {
      return {
        code: 401,
        success: false,
        message: "Vous devez être connecté",
      };
    }

    const bubble = await db.bubble.findUnique({
      where: { id },
    });

    if (!bubble) {
      return {
        code: 404,
        success: false,
        message: "Bulle non trouvée",
      };
    }

    if (bubble.authorId !== user.id) {
      return {
        code: 403,
        success: false,
        message: "Vous ne pouvez supprimer que vos propres bulles",
      };
    }

    await db.bubble.delete({
      where: { id },
    });

    return {
      code: 200,
      success: true,
      message: "Bulle supprimée avec succès",
    };
  },
};
