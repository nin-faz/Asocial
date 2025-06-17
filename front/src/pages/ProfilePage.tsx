import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ThumbsDown,
  MessageSquare,
  Settings,
  LogOut,
  Save,
  X,
  Share2,
  Download,
  MoreVertical,
  Trash2,
  Edit2,
  BarChart2,
  Trophy,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  UPDATE_USER,
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
  DELETE_ARTICLE,
} from "../mutations";
import {
  GET_USER_BY_ID,
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
  FIND_ARTICLES_BY_USER,
} from "../queries";
import { toast } from "react-toastify";
import {
  showLoginRequiredToast,
  showArticleDeletedToast,
  showProfileUpdatedToast,
} from "../utils/customToasts";
import PublicationDetailsPage from "./publications/PublicationDetailsPage";
import IconSelector from "../components/icons/IconSelector";
import { renderUserIcon } from "../utils/iconUtil";
import UserIcon from "../components/icons/UserIcon";
import { GET_LEADERBOARD } from "../queries/userQuery";

const MyProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "publications");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [iconName, setIconName] = useState("Skull");

  const [error, setError] = useState("");

  const [numberOfPostDisliked, setNumberOfPostDisliked] = useState(0);

  const [userArticleDislikes, setUserArticleDislikes] = useState<{
    [key: string]: boolean;
  }>({});

  // State for dropdown menu
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!auth) return null;

  const { token, user, logout } = auth;

  useEffect(() => {
    if (!token || !user) {
      console.warn("Utilisateur déconnecté, redirection...");
      navigate("/");
    }
  }, [token, user, navigate]);

  const { data: userInfos, refetch: refetchUserInfos } = useQuery(
    GET_USER_BY_ID,
    {
      variables: { id: user?.id! },
      skip: !user,
    }
  );

  const userInfosData = userInfos?.findUserById;

  const { data: leaderboardData } = useQuery(GET_LEADERBOARD);

  const top1User = leaderboardData?.findAllUsers?.length
    ? [...leaderboardData.findAllUsers].sort(
        (a, b) => (b.scoreGlobal ?? 0) - (a.scoreGlobal ?? 0)
      )[0]
    : null;
  const isTop1 = userInfosData?.id && top1User?.id === userInfosData.id;

  const { data: articleDisliked, refetch: refetchArticleDisliked } = useQuery(
    FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
    {
      variables: { userId: user?.id! },
      skip: !user,
    }
  );

  const dislikesByUser = articleDisliked?.getDislikesByUserIdForArticles ?? [];

  const [updateUserMutation, { loading: updating }] = useMutation(UPDATE_USER);
  const [addArticleDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteArticleDislike] = useMutation(DELETE_ARTICLE_DISLIKE);
  const [deleteArticle] = useMutation(DELETE_ARTICLE);
  const { data: articleByUser, refetch: refetchArticleByUser } = useQuery(
    FIND_ARTICLES_BY_USER,
    {
      variables: { userId: user?.id ?? "" },
      skip: !user,
    }
  );

  const articleByUserData = articleByUser?.findArticlesByUser ?? [];

  const [articleDislikes, setArticleDislikes] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (articleByUserData) {
      const initialDislikes = articleByUserData.reduce((acc, article) => {
        acc[article.id] = article.TotalDislikes ?? 0;
        return acc;
      }, {} as { [key: string]: number });
      setArticleDislikes(initialDislikes);
    }
  }, [articleByUserData]);

  useEffect(() => {
    if (!user) {
      setUserArticleDislikes({});
      return;
    }

    const dislikesMap: { [key: string]: boolean } = {};

    if (articleDisliked?.getDislikesByUserIdForArticles) {
      articleDisliked.getDislikesByUserIdForArticles.forEach((dislike) => {
        if (dislike?.article?.id) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }

    setUserArticleDislikes(dislikesMap);

    setNumberOfPostDisliked(dislikesByUser.length);
  }, [dislikesByUser, user, articleDisliked]);

  useEffect(() => {
    if (userInfosData) {
      setUsername(userInfosData.username ?? "");
      setBio(userInfosData.bio ?? "");
      setIconName(userInfosData.iconName ?? "Skull");
    }
  }, [userInfosData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await updateUserMutation({
        variables: {
          id: user?.id!,
          body: {
            username,
            bio,
            iconName,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (data?.updateUser.success) {
        setIsEditing(false);
        setError("");
        await refetchUserInfos();
        showProfileUpdatedToast();
      } else {
        setError(data?.updateUser.message!);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Une erreur est survenue lors de la mise à jour du profil.");
    }
  };

  const cancelEditing = () => {
    if (user) {
      setUsername(userInfosData?.username! ?? "");
      setBio(userInfosData?.bio! ?? "");
      setIconName(userInfosData?.iconName ?? "Skull");
    }
    setIsEditing(false);
    setError("");
  };

  const handleArticleDislike = async (
    e: React.MouseEvent,
    articleId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showLoginRequiredToast("dislike");
      return;
    }

    try {
      // Mettre à jour l'état local immédiatement pour une réponse instantanée
      const newDislikeState = !userArticleDislikes[articleId];
      setUserArticleDislikes((prev) => ({
        ...prev,
        [articleId]: newDislikeState,
      }));

      // Mettre à jour le compteur de dislikes immédiatement
      const currentCount = articleDislikes[articleId] || 0;
      setArticleDislikes((prev) => ({
        ...prev,
        [articleId]: newDislikeState ? currentCount + 1 : currentCount - 1,
      }));

      if (newDislikeState) {
        await addArticleDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a disliké l'article.");
      } else {
        await deleteArticleDislike({
          variables: { articleId, userId: user.id! },
        });
        console.log(user.username, "a retiré son dislike.");
      }

      await refetchArticleDisliked();
      await refetchArticleByUser();
    } catch (err) {
      // En cas d'erreur, remettre l'état précédent
      setUserArticleDislikes((prev) => ({
        ...prev,
        [articleId]: !userArticleDislikes[articleId],
      }));
      setArticleDislikes((prev) => ({
        ...prev,
        [articleId]: articleDislikes[articleId],
      }));
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const response = await deleteArticle({
        variables: { id: articleId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.deleteArticle?.success) {
        showArticleDeletedToast();
        await refetchArticleByUser();
        console.log("Article supprimé avec succès !");
      } else {
        console.error(
          response?.data?.deleteArticle?.message ||
            "Echec de la suppression de l'article."
        );
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    }
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/publications/${articleId}?edit=true`);
  };

  // Effet pour rafraîchir les données quand on revient sur la page
  useEffect(() => {
    // Rafraîchir les articles de l'utilisateur quand la page est affichée
    refetchArticleByUser();
    refetchArticleDisliked();
  }, [location.pathname]);

  const handlePostClick = (articleId: string) => {
    setSelectedArticle(articleId);
  };

  const handleExportUserData = () => {
    if (!user || !userInfosData || !articleByUserData) {
      toast.error("Impossible d'exporter les données");
      return;
    }

    // Données d'objet avec toutes les infos du user
    const userData = {
      profile: {
        id: user.id,
        username: userInfosData.username,
        bio: userInfosData.bio,
        createdAt: userInfosData.createdAt,
        totalDislikes: userInfosData.TotalDislikes || 0,
        totalComments: userInfosData.TotalComments || 0,
      },
      publications: articleByUserData.map((article) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        createdAt: article.createdAt,
        totalDislikes: article.TotalDislikes,
        totalComments: article.TotalComments,
      })),
      dislikes: dislikesByUser
        ? dislikesByUser
            .filter((dislike) => dislike?.article)
            .map((dislike) => ({
              articleId: dislike?.article?.id,
              articleTitle: dislike?.article?.title,
              articleAuthor: dislike?.article?.author.username,
              createdAt: dislike?.article?.createdAt,
            }))
        : [],
    };

    const jsonData = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asocial-data-${user.username}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Données exportées avec succès !");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/profile?tab=${tab}`, { replace: true });
  };

  // Fonction pour partager un article
  const handleShareArticle = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
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

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-900"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          {isEditing ? (
            <IconSelector currentIcon={iconName} onSelectIcon={setIconName} />
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-32 h-32 rounded-full bg-purple-900 flex items-center justify-center relative cursor-pointer group"
              onClick={() => setIsEditing(true)}
            >
              {renderUserIcon(userInfosData?.iconName, "large")}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-sm text-center font-medium">
                  Cliquez pour modifier
                </p>
              </div>
            </motion.div>
          )}
          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Nom d'utilisateur
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-800 text-gray-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 text-gray-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {error && <div className="text-red-400 text-sm">{error}</div>}{" "}
                <div className="flex justify-end space-x-2 sm:space-x-3">
                  <button
                    onClick={cancelEditing}
                    className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                    Annuler
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    disabled={updating}
                    className={`flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                      updating
                        ? "bg-purple-800"
                        : "bg-purple-600 hover:bg-purple-700"
                    } text-white rounded-lg`}
                  >
                    <Save className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                    {updating ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center md:justify-start">
                  {username}
                  {isTop1 && (
                    <span className="ml-3 px-2 py-1 bg-yellow-400/80 text-yellow-900 rounded text-xs font-bold shadow flex items-center gap-1 animate-pulse">
                      <Trophy className="h-4 w-4 text-yellow-700" /> TOP 1
                    </span>
                  )}
                </h1>
                <p className="text-gray-500 mb-4">
                  Membre depuis{" "}
                  {userInfosData?.createdAt
                    ? new Date(userInfosData.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "?"}
                </p>
                <p className="text-gray-300 mb-6 max-w-2xl">{bio}</p>
                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                  <div className="flex items-center space-x-2 hover:text-purple-400">
                    <MessageSquare className="h-5 w-5" />
                    <span>{articleByUserData?.length || 0} publications</span>
                  </div>
                  <div className="flex items-center space-x-2 hover:text-purple-400">
                    <ThumbsDown className="h-5 w-5" />
                    <span>
                      {userInfosData?.TotalDislikes ?? 0} dislikes reçus
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 hover:text-purple-400">
                    <MessageSquare className="h-5 w-5" />
                    <span>
                      {userInfosData?.TotalComments || 0} commentaires reçus
                    </span>
                  </div>
                </div>
                {/* Edit Profile Button */}{" "}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto md:mx-0"
                >
                  <Settings className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                  Modifier le profil
                </motion.button>
              </>
            )}
          </div>{" "}
          {/* Actions */}
          <div className="flex md:flex-col gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg"
              onClick={() => setIsEditing(!isEditing)}
              title="Modifier son profil"
            >
              <Settings className="h-5 sm:h-6 w-5 sm:w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg"
              onClick={handleExportUserData}
              title="Exporter mes données"
            >
              <Download className="h-5 sm:h-6 w-5 sm:w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut className="h-5 sm:h-6 w-5 sm:w-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>{" "}
      {/* Tabs */}
      <div className="mt-8 border-b border-purple-900">
        <nav className="flex justify-center md:justify-between w-full mx-auto overflow-x-auto">
          <button
            className={`px-3 sm:px-6 py-3 text-center flex-1 whitespace-nowrap transition-all duration-200 ${
              activeTab === "publications"
                ? "text-purple-400 border-b-2 border-purple-500 font-medium"
                : "text-gray-500 hover:text-gray-300 "
            }`}
            onClick={() => handleTabChange("publications")}
          >
            <span className="flex items-center justify-center">
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
              Publications
            </span>
          </button>{" "}
          <button
            className={`px-3 sm:px-6 py-3 text-center flex-1 whitespace-nowrap transition-all duration-200 ${
              activeTab === "dislikes"
                ? "text-purple-400 border-b-2 border-purple-500 font-medium"
                : "text-gray-500 hover:text-gray-300 "
            }`}
            onClick={() => handleTabChange("dislikes")}
          >
            <span className="flex items-center justify-center">
              <ThumbsDown className="h-4 w-4 mr-1 sm:mr-2" />
              Dislikes
            </span>
          </button>
          <button
            className={`px-3 sm:px-6 py-3 text-center flex-1 whitespace-nowrap transition-all duration-200 ${
              activeTab === "statistiques"
                ? "text-purple-400 border-b-2 border-purple-500 font-medium"
                : "text-gray-500 hover:text-gray-300 "
            }`}
            onClick={() => handleTabChange("statistiques")}
          >
            <span className="flex items-center justify-center">
              <BarChart2 className="h-4 w-4 mr-1 sm:mr-2" />
              Statistiques
            </span>
          </button>
        </nav>
      </div>
      {/* Feed */}
      <div className="mt-8 space-y-6">
        {activeTab === "publications" && (
          <div className="space-y-6 mt-4">
            {articleByUserData && articleByUserData.length > 0 ? (
              articleByUserData.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                    transition: {
                      duration: 0.2,
                      ease: "easeOut",
                    },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePostClick(article.id)}
                  className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-900 cursor-pointer hover:border-purple-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                        {renderUserIcon(userInfosData?.iconName, "small")}
                      </div>{" "}
                      <p className="text-gray-500 text-sm">
                        Publié le{" "}
                        {article.updatedAt
                          ? new Date(parseInt(article.updatedAt, 10))
                              .toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              .replace(" ", " à ")
                          : new Date(parseInt(article.createdAt ?? "0", 10))
                              .toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              .replace(" ", " à ")}
                      </p>
                    </div>

                    {/* Menu button with dropdown */}
                    <div className="relative">
                      <button
                        className="text-gray-500 hover:text-purple-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            article.id === showMenu ? null : article.id
                          );
                        }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {showMenu === article.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, x: 20 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-0 right-5 w-36 bg-gray-800 text-white rounded-md shadow-lg p-2 space-y-2 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteArticle(article.id);
                              setShowMenu(null);
                            }}
                            className="flex items-center space-x-2 text-red-500 hover:text-red-400 w-full"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span>Supprimer</span>
                          </button>
                          <hr className="border-gray-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditArticle(article.id);
                              setShowMenu(null);
                            }}
                            className="flex items-center space-x-2 text-purple-500 hover:text-purple-400 w-full"
                          >
                            <Edit2 className="h-5 w-5" />
                            <span>Modifier</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="py-2">
                    <h2 className="text-xl font-semibold text-purple-400 mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">
                      {article.content}
                    </p>{" "}
                    {/* Ajout de l'affichage de l'image si elle existe */}
                    {article.imageUrl && (
                      <div className="mb-6 rounded-lg overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt="Article"
                          className="w-full h-auto rounded-lg max-h-80 object-contain sm:object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>{" "}
                  <div className="flex items-center justify-between text-gray-500 border-t border-gray-800 pt-4">
                    <div className="flex items-center space-x-2 sm:space-x-6 text-gray-500">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleArticleDislike(e, article.id)}
                        className={`flex items-center space-x-1 sm:space-x-2 hover:text-purple-400 ${
                          userArticleDislikes[article.id]
                            ? "text-purple-400"
                            : ""
                        }`}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span>{articleDislikes[article.id] || 0}</span>
                      </motion.button>
                      <button
                        className="flex items-center gap-2 hover:text-purple-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{article.TotalComments}</span>
                      </button>
                    </div>
                    <button
                      className="flex items-center space-x-2 hover:text-purple-400"
                      onClick={(e) => handleShareArticle(e, article.id)}
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Partager</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">Aucune publication trouvée.</p>
            )}
          </div>
        )}{" "}
        {selectedArticle && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ margin: 0 }}
          >
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-purple-400 z-10"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="p-6">
                <PublicationDetailsPage
                  articleId={selectedArticle}
                  isModal={true}
                  onClose={() => setSelectedArticle(null)}
                />
              </div>
            </motion.div>
          </div>
        )}{" "}
        {/* Onglet Dislikes */}
        {activeTab === "dislikes" && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            {dislikesByUser && dislikesByUser.length > 0 ? (
              dislikesByUser
                .filter((dislike) => dislike?.article)
                .map((dislike) => (
                  <motion.div
                    key={dislike?.article?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                      transition: {
                        duration: 0.2,
                        ease: "easeOut",
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-900 rounded-lg p-2 sm:p-6 border border-purple-900 hover:border-purple-700 transition-colors flex flex-col"
                  >
                    <div className="flex items-start sm:items-center space-x-2 mb-1 pb-5">
                      <button
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-900 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/users/${dislike?.article?.author.id}`);
                        }}
                        title={`Voir le profil de ${dislike?.article?.author.username}`}
                      >
                        <UserIcon
                          iconName={dislike?.article?.author.iconName}
                          size="small"
                        />
                      </button>
                      <div>
                        <button
                          className="text-purple-400 font-semibold text-xs sm:text-sm leading-tight break-words max-w-[5.5em] sm:max-w-full hover:underline focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${dislike?.article?.author.id}`);
                          }}
                          title={`Voir le profil de ${dislike?.article?.author.username}`}
                        >
                          {dislike?.article?.author.username}
                        </button>{" "}
                        <p className="text-gray-500 text-sm">
                          {new Date(parseInt(dislike?.article?.createdAt!, 10))
                            .toLocaleString("fr-FR", {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                            })
                            .replace(" ", " à ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col flex-grow justify-between">
                      {dislike?.article?.title && (
                        <h1 className="sm:text-2xl font-semibold text-gray-100 pb-3">
                          {dislike?.article?.title}
                        </h1>
                      )}
                      <p className="text-sm sm:text-base text-gray-300 mb-4 whitespace-pre-wrap flex-grow">
                        {dislike?.article?.content}
                      </p>
                      {/* Ajout de l'affichage de l'image si elle existe */}
                      {dislike?.article?.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={dislike?.article?.imageUrl}
                            alt="Article"
                            className="w-full h-auto rounded-lg max-h-60 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-end text-gray-500 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) =>
                            handleArticleDislike(e, dislike?.article?.id!)
                          }
                          className="flex items-end space-x-2 text-sm text-purple-400"
                        >
                          <ThumbsDown className="w-4 h-4 sm:h-5 sm:w-5" />
                          <span>Disliké</span>
                        </motion.button>

                        <button
                          className="hidden sm:flex items-center space-x-2 hover:text-purple-400"
                          onClick={(e) =>
                            handleShareArticle(e, dislike?.article?.id!)
                          }
                        >
                          <Share2 className="h-5 w-5" />
                          <span>Partager</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <p className="text-gray-500">Aucun article disliké.</p>
            )}
          </div>
        )}{" "}
        {activeTab === "statistiques" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
            {/* Première carte: Activité totale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
              }}
              className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-900 hover:border-purple-700 transition-all h-full"
            >
              <h3 className="text-purple-400 font-semibold mb-4 text-lg border-b border-gray-800 pb-2">
                Activité totale
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Publications</span>
                  <span className="text-purple-400 font-semibold">
                    {articleByUserData?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dislikes donnés</span>
                  <span className="text-purple-400 font-semibold">
                    {numberOfPostDisliked}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dislikes reçus</span>
                  <span className="text-purple-400 font-semibold">
                    {userInfosData?.TotalDislikes || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Deuxième carte: Engagement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
              }}
              className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-900 hover:border-purple-700 transition-all h-full"
            >
              <h3 className="text-purple-400 font-semibold mb-4 text-lg border-b border-gray-800 pb-2">
                Engagement
              </h3>
              <p className="text-gray-400 text-xs mb-4">
                <span className="block mb-1">
                  <strong>Taux d'engagement</strong> = dislikes reçus /
                  publications (mesure la moyenne de dislikes reçus par
                  publication).
                </span>
                <span>
                  <strong>Quotient de haine</strong> = dislikes donnés /
                  publications (mesure la moyenne de dislikes que tu as donnés
                  par publication).
                </span>
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taux d'engagement</span>
                  <span className="text-purple-400 font-semibold">
                    {(
                      (userInfosData?.TotalDislikes || 0) /
                      (articleByUserData?.length || 1)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Quotient de haine</span>
                  <span className="text-purple-400 font-semibold">
                    {(
                      numberOfPostDisliked / (articleByUserData?.length || 1)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Troisième carte: Dernière activité */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
              }}
              className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-900 hover:border-purple-700 transition-all h-full md:col-span-2 lg:col-span-1"
            >
              <h3 className="text-purple-400 font-semibold mb-4 text-lg border-b border-gray-800 pb-2">
                Dernière activité
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dernière publication</span>
                  <span className="text-purple-400 font-semibold">
                    {articleByUserData && articleByUserData.length > 0
                      ? new Date(
                          parseInt(articleByUserData[0].createdAt)
                        ).toLocaleDateString()
                      : "Aucune"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Membre depuis</span>
                  <span className="text-purple-400 font-semibold">
                    {new Date(
                      userInfosData?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Jours de présence</span>
                  <span className="text-purple-400 font-semibold">
                    {Math.floor(
                      (Date.now() -
                        new Date(
                          userInfosData?.createdAt || Date.now()
                        ).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyProfilePage;
