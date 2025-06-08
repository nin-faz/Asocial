import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { Loader, MessageSquare, Share2, ThumbsDown } from "lucide-react";
import { GET_USER_BY_ID } from "../queries/userQuery";
import { FIND_ARTICLES_BY_USER } from "../queries/articleQuery";
import { FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES } from "../queries/dislikeQuery";
import UserIcon from "../components/icons/UserIcon";
import { toast } from "react-toastify";
import {
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
} from "../mutations/dislikeMutation";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { showLoginRequiredToast } from "../utils/customToasts";

const UserProfilePage = () => {
  const { userId } = useParams();
  const userIdString = userId ?? "";
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userIdString },
    skip: !userIdString,
  });

  const { data: articlesData, loading: articlesLoading } = useQuery(
    FIND_ARTICLES_BY_USER,
    {
      variables: { userId: userIdString },
      skip: !userIdString,
    }
  );

  const auth = useContext(AuthContext);
  const user = userData?.findUserById;
  const articles = articlesData?.findArticlesByUser || [];
  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [addDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  // Ajout de la requête pour récupérer les dislikes de l'utilisateur connecté
  const { data: dislikeUser, refetch: refetchDislikeUser } = useQuery(
    FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
    {
      variables: { userId: auth?.user?.id! },
      skip: !auth?.user?.id,
    }
  );
  const { refetch: refetchArticlesByUser } = useQuery(FIND_ARTICLES_BY_USER, {
    variables: { userId: userIdString },
    skip: !userIdString,
  });

  // Synchronisation de l'état userDislikes comme dans PublicationPage
  useEffect(() => {
    if (!auth?.user) {
      if (Object.keys(userDislikes).length !== 0) {
        setUserDislikes({});
      }
      return;
    }
    const dislikesMap: { [key: string]: boolean } = {};
    articles.forEach((article) => {
      if (article.dislikes?.some((d: any) => d?.user?.id === auth.user?.id)) {
        dislikesMap[article.id] = true;
      }
    });
    if (dislikeUser?.getDislikesByUserIdForArticles) {
      dislikeUser.getDislikesByUserIdForArticles.forEach((dislike: any) => {
        if (dislike?.article) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }
    const isEqual = (a: typeof userDislikes, b: typeof dislikesMap) => {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) => a[key] === b[key]);
    };
    if (!isEqual(userDislikes, dislikesMap)) {
      setUserDislikes(dislikesMap);
    }
  }, [articles, dislikeUser, auth?.user]);

  useEffect(() => {
    if (auth?.user?.id && userIdString && auth.user.id === userIdString) {
      navigate("/profile", { replace: true });
    }
  }, [auth?.user?.id, userIdString, navigate]);

  if (userLoading || articlesLoading) {
    return <Loader />;
  }

  const handleShareArticle = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/publications/${articleId}`;
    const shareTitle = "Découvrez cet article sur Asocial";
    const shareText = "Rejoignez la discussion sur cet article intéressant!";

    try {
      // Vérifier si l'API Web Share est disponible
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copier le lien dans le presse-papier
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Lien copié dans le presse-papier!");
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast.error("Impossible de partager cet article");
    }
  };

  const handleDislike = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    if (!auth?.user) {
      showLoginRequiredToast("dislike");
      return;
    }
    const alreadyDisliked = userDislikes[articleId];
    try {
      if (!alreadyDisliked) {
        await addDislike({ variables: { articleId, userId: auth.user.id! } });
      } else {
        await deleteDislike({
          variables: { articleId, userId: auth.user.id! },
        });
      }
      // Refetch pour resynchroniser le compteur et la couleur
      await Promise.all([refetchArticlesByUser(), refetchDislikeUser()]);
    } catch {
      toast.error("Erreur lors du dislike");
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header profil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-900"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-purple-900 flex items-center justify-center">
            <UserIcon iconName={user?.iconName} size="large" />
          </div>
          {/* Infos */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-purple-400 mb-2">
              {user?.username}
            </h1>
            <p className="text-gray-500 mb-4">
              Membre depuis{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    month: "short",
                    year: "numeric",
                  })
                : "?"}
            </p>
            <p className="text-gray-300 mb-6 max-w-2xl">
              {user?.bio ?? "Cet utilisateur n'a pas encore de bio."}
            </p>
            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
              <div className="flex items-center space-x-2 hover:text-purple-400">
                <MessageSquare className="h-5 w-5" />
                <span>{articles.length} publications</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-purple-400">
                <ThumbsDown className="h-5 w-5" />
                <span>{user?.TotalDislikes ?? 0} dislikes reçus</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-purple-400">
                <MessageSquare className="h-5 w-5" />
                <span>{user?.TotalComments ?? 0} commentaires reçus</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Publications */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-purple-400 mb-4">
          Publications
        </h2>
        {/* Grille 3 colonnes sur tous les écrans, même mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
          {articles.length === 0 ? (
            <p className="text-gray-500 col-span-3">
              Aucune publication trouvée.
            </p>
          ) : (
            articles.map((article) => {
              return (
                <motion.div
                  key={article.id}
                  data-article-id={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                    transition: { duration: 0.2, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-900 rounded-lg p-2 sm:p-6 border border-purple-900 hover:border-purple-700 transition-colors flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/publications/${article.id}`)}
                >
                  <div className="flex items-center space-x-2 mb-1 pb-3">
                    <div>
                      <UserIcon
                        iconName={article.author?.iconName ?? user?.iconName}
                        size="small"
                      />
                    </div>
                    <div>
                      <h3 className="text-purple-400 font-semibold text-xs leading-tight">
                        {article.author?.username || user?.username}
                      </h3>
                      <p className="text-gray-500 text-[10px] leading-tight">
                        {article.updatedAt
                          ? new Date(
                              parseInt(article.updatedAt, 10)
                            ).toLocaleString("fr-FR", {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                            })
                          : new Date(
                              parseInt(article.createdAt ?? "0", 10)
                            ).toLocaleString("fr-FR", {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                      </p>
                    </div>
                  </div>
                  {article.title && (
                    <h2 className="text-[0.95rem] font-semibold text-purple-400 line-clamp-2 min-h-[2.1rem]">
                      {article.title}
                    </h2>
                  )}
                  <p className="text-gray-300 text-xs mb-2 whitespace-pre-wrap line-clamp-3 flex-grow">
                    {article.content}
                  </p>

                  {article.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden w-full h-[20em] aspect-[4/3] bg-gray-800 flex items-center justify-center min-h-[80px] max-h-[140px] sm:min-h-[25em]">
                      <img
                        src={article.imageUrl}
                        alt={article.title ?? "Article"}
                        className="w-full h-full object-cover object-center rounded-lg transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-end mt-2 pt-3 border-t border-gray-800 text-gray-500 text-xs">
                    <button
                      className={`flex items-center space-x-1 hover:text-purple-400 ${
                        userDislikes[article.id] ? "text-purple-400" : ""
                      }`}
                      onClick={(e) => handleDislike(e, article.id)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="dislike-count">
                        {article.TotalDislikes ?? 0}
                      </span>
                    </button>
                    <div className="flex items-center space-x-1 hover:text-purple-400">
                      <MessageSquare className="h-4 w-4" />
                      <span>{article.TotalComments ?? 0}</span>
                    </div>
                    <button
                      className="flex items-center space-x-2 hover:text-purple-400"
                      onClick={(e) => handleShareArticle(e, article.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
