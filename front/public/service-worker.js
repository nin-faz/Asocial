// public/service-worker.js
self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Notification", body: event.data.text() };
  }
  const options = {
    body: data.body,
    icon: "/logo_192.png",
    badge: "/logo_192.png",
    data: { url: data.url || "/" },
    requireInteraction: true, // La notif reste affichée jusqu'à action utilisateur
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
  event.notification.close();
  event.waitUntil(
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
  );
});
