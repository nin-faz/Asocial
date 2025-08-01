import webpush from "web-push";
import db from "../datasource/db.js";

// Les clés VAPID doivent être dans le .env
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT! ?? "mailto:asocial.network.contact@gmail.com",
  process.env.VAPID_PUBLIC_KEY! ??
    "BJaZF6hvnoVCh-55CRdAd6Vy5E_0D0YEhoqwXBFJGYwArsNVTKHI3g5143_I6Gn5fMIeoBItCuO-pQRzMUfm_TM",
  process.env.VAPID_PRIVATE_KEY! ??
    "hMvjU5EK3NvoWRWNGVnfHCYRVTE5LGNXc46MrhCG2HI"
);

/**
 * Envoie une notification push à tous les abonnements d’un utilisateur
 * @param userId id de l’utilisateur cible
 * @param payload objet à envoyer (sera stringifié)
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: object
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });
  const notificationPayload = JSON.stringify(payload);
  for (const sub of subscriptions) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.auth,
        p256dh: sub.p256dh,
      },
    };
    try {
      await webpush.sendNotification(pushSub, notificationPayload);
    } catch (err: any) {
      // Si l’abonnement n’est plus valide, on le supprime
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
      } else {
        console.error("Erreur envoi push:", err);
      }
    }
  }
}
