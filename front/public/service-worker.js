// public/service-worker.js
self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Notification", body: event.data.text() };
  }

  // Gestion de la fermeture ciblée d'une notification (type: 'close')
  if (data.type === "close" && data.tag) {
    event.waitUntil(
      self.registration
        .getNotifications({ tag: String(data.tag) })
        .then((notifications) => {
          notifications.forEach((notif) => notif.close());
        })
    );
    return;
  }

  const options = {
    body: data.body,
    icon: "/logo_192.png",
    badge: "/logo_192.png",
    data: {
      url: data.url || "/",
      id: data.id || null, // Ajout pour traçabilité
      tag: data.tag || null,
    },
    requireInteraction: true, // La notif reste affichée jusqu'à action utilisateur
    tag: String(data.tag), // Toujours string
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", options)
  );
  // Badge Android (si supporté)
  if ("setAppBadge" in navigator && typeof data.unreadCount === "number") {
    navigator.setAppBadge(data.unreadCount);
  } else if ("setAppBadge" in navigator) {
    navigator.setAppBadge(1);
  }
});

self.addEventListener("notificationclick", function (event) {
  const url = (event.notification.data && event.notification.data.url) || "/";
  const notifId = event.notification.data && event.notification.data.id;
  event.notification.close();
  // Marquer la notification comme lue côté backend si id présent
  let markAsReadPromise = Promise.resolve();
  if (notifId) {
    // Récupère le token JWT du localStorage (clé typique)
    const token = localStorage.getItem("token");
    if (token) {
      markAsReadPromise = fetch("/api/notifications/mark-as-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [notifId] }),
      });
    }
  }
  event.waitUntil(
    markAsReadPromise.then(() =>
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(function (clientList) {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(self.location.origin)) {
              client.focus();
              client.navigate(url);
              return;
            }
          }
          clients.openWindow(url);
        })
    )
  );
});
