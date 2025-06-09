import { useQuery, useMutation } from "@apollo/client";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { GetNotificationsDocument } from "../gql/graphql";
import { MARK_NOTIFICATIONS_AS_READ } from "../mutations/notificationMutation";
import NotificationsPanel from "../components/notifications/NotificationsPanel";
import Loader from "../components/Loader";
import { PushNotificationsProvider } from "../context/PushNotificationsContext";
import { RefreshCw } from "lucide-react";

export default function NotificationsPage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const PAGE_SIZE = 50;
  const { data, loading, refetch } = useQuery(GetNotificationsDocument, {
    variables: { userId: user?.id!, limit: PAGE_SIZE, offset: 0 },
    skip: !user,
    fetchPolicy: "network-only",
  });
  const [markAllAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ, {
    onCompleted: () => refetch(),
  });
  const notifications = (data?.getNotifications ?? []).map((n: any) => ({
    ...n,
    articleId: n.articleId ?? undefined,
    commentId: n.commentId ?? undefined,
  }));

  if (loading) return <Loader />;

  return (
    <PushNotificationsProvider>
      <main className="w-full min-h-[80vh] py-16 flex flex-col items-center bg-black justify-end">
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 w-full max-w-2xl justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 text-center drop-shadow-lg w-full pt-8">
              Notifications
            </h1>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="bg-gray-800 text-gray-300 p-1.5 sm:p-2.5 rounded-lg border border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 mt-6"
              title="Rafraîchir les notifications"
            >
              <RefreshCw
                className={`h-5 w-5 text-purple-400 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-2xl px-0 sm:px-2">
              <NotificationsPanel
                notifications={notifications}
                onMarkAsRead={async (id) => {
                  await markAllAsRead({ variables: { ids: [id] } });
                }}
                onNavigate={(notif) => {
                  let link = undefined;
                  if (notif.articleId && notif.commentId) {
                    link = `/publications/${notif.articleId}?commentId=${notif.commentId}`;
                  } else if (notif.articleId) {
                    link = `/publications/${notif.articleId}`;
                  }
                  if (link) {
                    window.location.href = link;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </PushNotificationsProvider>
  );
}
