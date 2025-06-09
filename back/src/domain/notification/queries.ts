import { QueryResolvers } from "../../types.js";

export const getNotifications: QueryResolvers["getNotifications"] = async (
  _,
  { userId },
  { dataSources: { db } }
) => {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        article: true,
        comment: true,
      },
    });
    return notifications.map((notif) => ({
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
