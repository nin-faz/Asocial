import { QueryResolvers } from "../../types.js";

type BubbleQueries = Pick<
  QueryResolvers,
  "getBubbles" | "getBubbleById" | "getBubbleMessages"
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
  messages: bubble.messages.map(transformMessage),
});

export const bubbleQueries: BubbleQueries = {
  getBubbles: async (
    _,
    { limit = 10, offset = 0 },
    { dataSources: { db } },
  ) => {
    const bubbles = await db.bubble.findMany({
      take: limit ?? 10,
      skip: offset ?? 0,
      include: {
        author: true,
        messages: {
          include: { author: true },
          orderBy: { createdAt: "desc" as const },
        },
      },
      orderBy: { createdAt: "desc" as const },
    });

    return bubbles.map(transformBubble);
  },

  getBubbleById: async (_, { id }, { dataSources: { db } }) => {
    const bubble = await db.bubble.findUnique({
      where: { id },
      include: {
        author: true,
        messages: {
          include: { author: true },
          orderBy: { createdAt: "asc" as const },
        },
      },
    });

    if (!bubble) return null;
    return transformBubble(bubble);
  },

  getBubbleMessages: async (_, { bubbleId }, { dataSources: { db } }) => {
    const messages = await db.bubbleMessage.findMany({
      where: { bubbleId },
      include: { author: true },
      orderBy: { createdAt: "asc" as const },
    });

    return messages.map(transformMessage);
  },
};
