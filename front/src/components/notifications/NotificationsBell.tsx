import { useQuery, useMutation } from "@apollo/client";
import { GetNotificationsDocument } from "../../gql/graphql";
import { MARK_NOTIFICATIONS_AS_READ } from "../../mutations/notificationMutation";
import { Bell, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { io as socketIOClient, Socket } from "socket.io-client";
import { usePushNotifications } from "../../context/PushNotificationsContext";

const PAGE_SIZE = 20;

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, token } = React.useContext(AuthContext)!;
  const { pushEnabled, pushError, handleEnablePush, handleDisablePush } =
    usePushNotifications();
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
        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full relative"
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
            className="absolute sm:right-0 ml-[-5em] mt-2 w-[17em] max-w-lg sm:w-80 sm:max-w-80 max-h-60 overflow-y-scroll bg-gray-950/95 border border-purple-900 rounded-lg shadow-lg z-50"
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
                    if (unreadIds.length > 0) {
                      markAllAsRead({ variables: { ids: unreadIds } });
                    }
                  }}
                >
                  Marquer tout comme lu
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-800">
              {loading && notifications.length === 0 ? (
                <Loader />
              ) : unreadNotifications.length === 0 ? (
                <div className="p-4 text-gray-400 text-center">
                  Aucune notification
                </div>
              ) : (
                unreadNotifications.map((notif: any) => {
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

                  const handleMarkAsRead = async () => {
                    if (!notif.isRead && !marking) {
                      await markAllAsRead({
                        variables: { ids: [notif.id] },
                      });
                    }
                  };

                  return (
                    <motion.div
                      key={notif.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-800 flex flex-col gap-1 transition-colors bg-purple-950/60 border-l-4 border-purple-500 overflow-hidden relative`}
                      onClick={async () => {
                        setOpen(false);
                        await handleMarkAsRead();
                        if (link) {
                          navigate(link);
                        }
                      }}
                      drag="x"
                      dragConstraints={{ left: -100, right: 100 }}
                      dragElastic={0.1}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 80) {
                          // Si glissé suffisamment vers la droite
                          handleMarkAsRead();
                        }
                        if (info.offset.x < -80) {
                          // Si glissé suffisamment vers la gauche
                          handleMarkAsRead();
                        }
                      }}
                      whileDrag={{
                        backgroundColor: "rgba(139, 92, 246, 0.2)",
                      }}
                    >
                      {/* Indicateur de swipe */}
                      <motion.div
                        className="absolute inset-y-0 right-0 flex items-center text-green-400 pr-2 opacity-0 text-xs"
                        style={{
                          opacity: 0,
                          x: -20,
                        }}
                        animate={{
                          opacity: 0,
                          x: -20,
                        }}
                        variants={{
                          swiping: {
                            opacity: 1,
                            x: 0,
                            transition: { duration: 0.2 },
                          },
                        }}
                        custom={{ direction: "right", dragging: false }}
                      >
                        ✓ Marquer lu
                      </motion.div>

                      {/* Indicateur de swipe à gauche */}
                      <motion.div
                        className="absolute inset-y-0 left-0 flex items-center text-green-400 pl-2 opacity-0 text-xs"
                        style={{
                          opacity: 0,
                          x: 20,
                        }}
                        animate={{
                          opacity: 0,
                          x: 20,
                        }}
                        variants={{
                          swiping: {
                            opacity: 1,
                            x: 0,
                            transition: { duration: 0.2 },
                          },
                        }}
                        custom={{ direction: "left", dragging: false }}
                      >
                        Marquer lu ✓
                      </motion.div>

                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        <span className="text-sm text-gray-100 font-semibold">
                          {notif.message}
                        </span>
                        <span className="ml-2 text-xs text-purple-400 font-bold">
                          Non lu
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            {/* Boutons d’activation push, bien intégrés */}
            {!pushEnabled && (
              <div className="flex flex-col items-center gap-2 px-4 py-3 border-t border-gray-800 bg-gray-950/90">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onClick={() => token && handleEnablePush(token)}
                  disabled={!!pushError}
                >
                  <Bell className="w-4 h-4" />
                  Activer les notifications
                </button>
                {pushError && (
                  <span className="text-xs text-red-400 mt-1">{pushError}</span>
                )}
              </div>
            )}
            {pushEnabled && (
              <div className="flex flex-col items-center gap-2 px-4 py-3 border-t border-gray-800 bg-gray-950/90">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Notifications activées
                  </span>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-red-700 text-red-300 font-semibold shadow transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mt-2"
                  onClick={() => token && handleDisablePush(token)}
                >
                  <Bell className="w-4 h-4" />
                  Désactiver les notifications
                </button>
                {pushError && (
                  <span className="text-xs text-red-400 mt-1">{pushError}</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsBell;
