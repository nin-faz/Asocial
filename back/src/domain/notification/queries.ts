import { QueryResolvers } from "../../types.js";

export const getNotifications: QueryResolvers["getNotifications"] = async (
  _,
  { limit = 20, offset = 0 },
  { dataSources: { db }, user }
) => {
  if (!user) return [];
  try {
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: offset ?? 0,
      take: limit ?? 20,
      include: {
        article: true,
        comment: true,
      },
    });
    return notifications.map((notif: any) => ({
      ...notif,
      createdAt: notif.createdAt.toISOString(),
      // Ne pas mapper notif.article ni notif.comment, laisse-les natifs
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const notificationQueries = {
  getNotifications,
};
