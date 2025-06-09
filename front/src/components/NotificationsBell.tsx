import { useQuery, useMutation } from "@apollo/client";
import { GetNotificationsDocument } from "../gql/graphql";
import { MARK_NOTIFICATIONS_AS_READ } from "../mutations/notificationMutation";
import { Bell, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { io as socketIOClient, Socket } from "socket.io-client";

const PAGE_SIZE = 20;

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, token } = React.useContext(AuthContext)!;
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, refetch, fetchMore } = useQuery(
    GetNotificationsDocument,
    {
      variables: { userId: user?.id!, limit: PAGE_SIZE, offset: 0 },
      skip: !user,
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setNotifications(data?.getNotifications ?? []);
        setOffset(data?.getNotifications?.length ?? 0);
        setHasMore((data?.getNotifications?.length ?? 0) === PAGE_SIZE);
      },
    }
  );

  const [markAllAsRead, { loading: marking }] = useMutation(
    MARK_NOTIFICATIONS_AS_READ,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        !loadingMore &&
        hasMore &&
        scrollHeight - scrollTop - clientHeight < 100
      ) {
        setLoadingMore(true);
        fetchMore({
          variables: { userId: user?.id!, limit: PAGE_SIZE, offset },
        }).then((res) => {
          const newNotifs = res.data?.getNotifications ?? [];
          setNotifications((prev) => [...prev, ...newNotifs]);
          setOffset((prev) => prev + newNotifs.length);
          setHasMore(newNotifs.length === PAGE_SIZE);
          setLoadingMore(false);
        });
      }
    },
    [loadingMore, hasMore, offset, user, fetchMore]
  );

  useEffect(() => {
    setNotifications(data?.getNotifications ?? []);
    setOffset(data?.getNotifications?.length ?? 0);
    setHasMore((data?.getNotifications?.length ?? 0) === PAGE_SIZE);
  }, [data]);

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

  // --- Socket.IO pour notifications temps réel ---
  useEffect(() => {
    if (!user || !token) return;
    // Connexion Socket.IO avec auth
    const socket: Socket = socketIOClient(
      import.meta.env.VITE_API_URL ?? "http://localhost:4000",
      {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
      }
    );

    socket.on("connect", () => {
      /* Socket.IO connecté pour notifications */
    });

    socket.on("notification", () => {
      refetch();
    });

    socket.on("disconnect", () => {
      /* Socket.IO déconnecté */
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

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
            className="absolute sm:right-0 ml-[-1em] mt-2 w-[90vw] max-w-lg sm:w-80 sm:max-w-80 max-h-60 overflow-y-scroll bg-gray-950/95 border border-purple-900 rounded-lg shadow-lg z-50"
            style={{
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(6px)",
            }}
            onScroll={handleScroll}
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
              {loading && notifications.length === 0 ? (
                <Loader />
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
                              setOpen(false);
                              if (!notif.isRead && !marking) {
                                await markAllAsRead({
                                  variables: { ids: [notif.id] },
                                });
                              }
                              if (link) {
                                navigate(link);
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
                              setOpen(false);
                              if (!notif.isRead && !marking) {
                                await markAllAsRead({
                                  variables: { ids: [notif.id] },
                                });
                              }
                              if (link) {
                                navigate(link);
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
                  {loadingMore && <Loader />}
                  {!hasMore && notifications.length > 0 && (
                    <div className="p-2 text-center text-xs text-gray-500">
                      Toutes les notifications sont chargées.
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
