import { useState } from "react";
import { Bell, ThumbsDown, MessageSquare } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  articleId?: string;
  commentId?: string;
}

interface Props {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (notif: Notification) => void;
}

const TABS = [
  { key: "all", label: "Tous", icon: <Bell className="w-4 h-4" /> },
  {
    key: "dislike",
    label: "Dislike",
    icon: <ThumbsDown className="w-4 h-4" />,
  },
  {
    key: "comment",
    label: "Commentaires",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

export default function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onNavigate,
}: Props) {
  const [tab, setTab] = useState("all");

  let filtered = notifications;
  if (tab === "dislike")
    filtered = notifications.filter((n) => n.type === "DISLIKE");
  if (tab === "comment")
    filtered = notifications.filter(
      (n) => n.type === "COMMENT" || n.type === "REPLY"
    );

  return (
    <div className="w-full max-w-full bg-gray-950 border border-purple-900 rounded-lg shadow-lg">
      <div className="flex border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`flex-1 py-2 flex items-center justify-center gap-1 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "text-purple-400 border-b-2 border-purple-500 bg-gray-900"
                : "text-gray-400 hover:text-purple-400"
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="h-dvh max-h-[25em] overflow-y-auto divide-y divide-gray-800">
        {filtered.length === 0 ? (
          <div className="p-4 text-gray-400 text-center justify-center">
            Aucune notification
          </div>
        ) : (
          filtered.map((notif) => {
            let link = undefined;
            if (notif.articleId && notif.commentId) {
              link = `/publications/${notif.articleId}?commentId=${notif.commentId}`;
            } else if (notif.articleId) {
              link = `/publications/${notif.articleId}`;
            }
            return (
              <div
                key={notif.id}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-800 flex flex-col gap-1 transition-colors
                  ${
                    !notif.isRead
                      ? "bg-purple-950/60 border-l-4 border-purple-500"
                      : "bg-gray-900/60 opacity-70"
                  }
                `}
                onClick={() => {
                  onMarkAsRead && onMarkAsRead(notif.id);
                  if (onNavigate && link) onNavigate(notif);
                }}
              >
                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  )}
                  <span
                    className={`text-sm ${
                      !notif.isRead
                        ? "text-gray-100 font-semibold"
                        : "text-gray-400"
                    }`}
                  >
                    {notif.message}
                  </span>
                  {!notif.isRead && (
                    <span className="ml-2 text-xs text-purple-400 font-bold">
                      Non lu
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
