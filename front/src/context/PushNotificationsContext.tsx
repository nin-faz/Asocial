import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { registerServiceWorkerAndSubscribe } from "../utils/pushNotifications";

const VAPID_PUBLIC_KEY =
  "BJaZF6hvnoVCh-55CRdAd6Vy5E_0D0YEhoqwXBFJGYwArsNVTKHI3g5143_I6Gn5fMIeoBItCuO-pQRzMUfm_TM";
const API_URL = import.meta.env.VITE_API_URL ?? "";

interface PushNotificationsContextType {
  pushEnabled: boolean;
  pushError: string | null;
  setPushEnabled: (v: boolean) => void;
  setPushError: (v: string | null) => void;
  handleEnablePush: (token: string) => Promise<void>;
  handleDisablePush: (token: string) => Promise<void>;
}

export const PushNotificationsContext = createContext<
  PushNotificationsContextType | undefined
>(undefined);

export const PushNotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifie l'état réel de la permission et de l'abonnement à chaque focus de la fenêtre
    const checkPushStatus = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        let enabled = false;
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          enabled = !!subscription;
        }
        // Si la permission navigateur est denied, on force pushEnabled à false et on désabonne
        if (Notification && Notification.permission === "denied") {
          if (registration) {
            const subscription =
              await registration.pushManager.getSubscription();
            if (subscription) {
              await subscription.unsubscribe();
            }
          }
          setPushEnabled(false);
          setPushError(
            "Permission refusée. Veuillez autoriser les notifications dans les réglages de votre navigateur, puis réessayez."
          );
        } else if (
          Notification &&
          Notification.permission === "granted" &&
          enabled
        ) {
          setPushEnabled(true);
          setPushError(null);
        } else {
          setPushEnabled(false);
          setPushError(null);
        }
      }
    };
    checkPushStatus();
    window.addEventListener("focus", checkPushStatus);
    return () => {
      window.removeEventListener("focus", checkPushStatus);
    };
  }, []);

  const handleEnablePush = async (token: string) => {
    setPushError(null);
    // Vérifie la permission à chaque clic
    if (Notification && Notification.permission === "denied") {
      setPushError(
        "Permission refusée. Veuillez autoriser les notifications dans les réglages de votre navigateur, puis réessayez."
      );
      setPushEnabled(false);
      return;
    }
    // Si l'utilisateur vient de réactiver dans les réglages, on peut réessayer
    try {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setPushError(
          "Permission refusée. Veuillez autoriser les notifications dans les réglages de votre navigateur, puis réessayez."
        );
        setPushEnabled(false);
        return;
      }
    } catch {
      setPushError("Impossible de demander la permission de notifications.");
      setPushEnabled(false);
      return;
    }
    const subscription = await registerServiceWorkerAndSubscribe(
      VAPID_PUBLIC_KEY
    );
    if (subscription) {
      function arrayBufferToBase64(buffer: ArrayBuffer | null): string | null {
        if (!buffer) return null;
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      }
      const authKey = subscription.getKey ? subscription.getKey("auth") : null;
      const p256dhKey = subscription.getKey
        ? subscription.getKey("p256dh")
        : null;
      if (!authKey || !p256dhKey) {
        setPushError(
          "Impossible d'extraire les clés d'abonnement push (auth/p256dh). Veuillez réessayer sur un navigateur compatible."
        );
        setPushEnabled(false);
        return;
      }
      await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            auth: arrayBufferToBase64(authKey),
            p256dh: arrayBufferToBase64(p256dhKey),
          },
        }),
      });
      setPushEnabled(true);
      setPushError(null);
    } else {
      setPushError("Impossible d'activer les notifications push.");
      setPushEnabled(false);
    }
  };

  const handleDisablePush = async (token: string) => {
    setPushError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription =
        registration && (await registration.pushManager.getSubscription());
      if (subscription) {
        await subscription.unsubscribe();
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      setPushEnabled(false);
      setPushError(null);
    } catch {
      setPushError("Impossible de désactiver les notifications push.");
    }
  };

  const contextValue = React.useMemo(
    () => ({
      pushEnabled,
      pushError,
      setPushEnabled,
      setPushError,
      handleEnablePush,
      handleDisablePush,
    }),
    [pushEnabled, pushError]
  );

  return (
    <PushNotificationsContext.Provider value={contextValue}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

export const usePushNotifications = () => {
  const ctx = useContext(PushNotificationsContext);
  if (!ctx)
    throw new Error(
      "usePushNotifications must be used within a PushNotificationsProvider"
    );
  return ctx;
};
