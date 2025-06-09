import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../queries/notificationQuery";
import { MARK_NOTIFICATIONS_AS_READ } from "../mutations/notificationMutation";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = React.useContext(AuthContext)!;
  const navigate = useNavigate();

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: user?.id! },
    skip: !user,
    fetchPolicy: "network-only",
  });

  const [markAllAsRead, { loading: marking }] = useMutation(
    MARK_NOTIFICATIONS_AS_READ,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  const notifications = data?.getNotifications ?? [];
  const unreadNotifications = notifications.filter((n: any) => !n.isRead);
  const readNotifications = notifications.filter((n: any) => n.isRead);
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        className="p-1 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full relative"
        whileHover={{ scale: 1.1 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-xs text-white rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute sm:right-0 ml-[-1em] mt-2 w-[50vw] max-w-lg sm:w-80 sm:max-w-80 max-h-96 overflow-y-auto bg-gray-950/95 border border-purple-900 rounded-lg shadow-lg z-50"
            style={{
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <span className="text-purple-400 font-semibold">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-purple-400 hover:underline"
                  onClick={() => {
                    const unreadIds = notifications
                      .filter((n: any) => !n.isRead)
                      .map((n: any) => n.id);
                    markAllAsRead({ variables: { ids: unreadIds } });
                  }}
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-800">
              {loading ? (
                <div className="p-4 text-gray-400">Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-gray-400">Aucune notification</div>
              ) : (
                <>
                  {unreadNotifications.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-xs text-purple-400 font-semibold bg-gray-900 sticky top-0 z-10">
                        Non lues
                      </div>
                      {unreadNotifications.map((notif: any) => {
                        let link = undefined;
                        // Navigation contextuelle stricte pour DISLIKE sur commentaire
                        if (
                          notif.type === "DISLIKE" &&
                          notif.articleId &&
                          notif.commentId
                        ) {
                          link = `/publications/${notif.articleId}?commentId=${notif.commentId}`;
                        } else if (notif.articleId && notif.commentId) {
                          link = `/publications/${notif.articleId}?commentId=${notif.commentId}`;
                        } else if (notif.articleId) {
                          link = `/publications/${notif.articleId}`;
                        }
                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-800 bg-gray-800/60 ${
                              marking ? "opacity-60 pointer-events-none" : ""
                            }`}
                            onClick={async () => {
                              console.log("Notification click", notif, link);
                              setOpen(false);
                              if (!notif.isRead && !marking) {
                                await markAllAsRead({
                                  variables: { ids: [notif.id] },
                                });
                              }
                              if (link) {
                                navigate(link);
                              } else {
                                console.warn(
                                  "No navigation link for notification",
                                  notif
                                );
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span className="text-sm text-gray-200">
                                {notif.message}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString(
                                "fr-FR",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {readNotifications.length > 0 && (
                    <div>
                      {unreadNotifications.length > 0 && (
                        <div className="my-1 border-t border-gray-800" />
                      )}
                      <div className="px-4 py-1 text-xs text-gray-500 font-semibold bg-gray-900 sticky top-0 z-10">
                        Lues
                      </div>
                      {readNotifications.map((notif: any) => {
                        let link = undefined;
                        // Navigation contextuelle stricte pour DISLIKE sur commentaire
                        if (
                          notif.type === "DISLIKE" &&
                          notif.articleId &&
                          notif.commentId
                        ) {
                          link = `/publications/${notif.articleId}?commentId=${notif.commentId}`;
                        } else if (notif.articleId && notif.commentId) {
                          link = `/publications/${notif.articleId}?commentId=${notif.commentId}`;
                        } else if (notif.articleId) {
                          link = `/publications/${notif.articleId}`;
                        }
                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-800 ${
                              marking ? "opacity-60 pointer-events-none" : ""
                            }`}
                            style={{ opacity: 0.6 }}
                            onClick={async () => {
                              console.log("Notification click", notif, link);
                              setOpen(false);
                              if (!notif.isRead && !marking) {
                                await markAllAsRead({
                                  variables: { ids: [notif.id] },
                                });
                              }
                              if (link) {
                                navigate(link);
                              } else {
                                console.warn(
                                  "No navigation link for notification",
                                  notif
                                );
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span className="text-sm text-gray-200">
                                {notif.message}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString(
                                "fr-FR",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsBell;
