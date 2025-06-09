import { MutationResolvers } from "../../types.js";

export const markNotificationsAsRead: NonNullable<
  MutationResolvers["markNotificationsAsRead"]
> = async (_, { ids }, { dataSources: { db }, user }) => {
  if (!user) {
    return {
      code: 401,
      success: false,
      message: "Unauthorized",
      notifications: [],
    };
  }
  const result = await db.notification.updateMany({
    where: { id: { in: ids }, userId: user.id },
    data: { isRead: true },
  });
  const updatedNotifications = await db.notification.findMany({
    where: { id: { in: ids }, userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return {
    code: 200,
    success: result.count > 0,
    message:
      result.count > 0
        ? "Notifications marked as read"
        : "No notifications updated",
    notifications: Array.isArray(updatedNotifications)
      ? updatedNotifications.map((notif) => ({
          ...notif,
          createdAt: notif.createdAt.toISOString(),
        }))
      : [],
  };
};

export const notificationMutations = {
  markNotificationsAsRead,
};
