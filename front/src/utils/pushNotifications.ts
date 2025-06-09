// src/utils/pushNotifications.ts

// Utilitaire pour enregistrer le service worker et s'abonner au push
export async function registerServiceWorkerAndSubscribe(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Notifications push non supportées sur ce navigateur.");
    return null;
  }
  try {
    // Enregistre le service worker
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );
    // Demande la permission à l'utilisateur
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Permission de notifications refusée.");
      return null;
    }
    // S'abonne au push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    return subscription;
  } catch (err) {
    console.error("Erreur abonnement push:", err);
    return null;
  }
}

// Conversion de la clé VAPID (base64) en Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
