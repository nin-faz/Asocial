import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ThumbsDown,
  MessageSquare,
  Skull,
  MoreVertical,
  SortDesc,
  Trash2,
  Edit2,
  Share2,
} from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import Loader from "../components/Loader";
import {
  CREATE_ARTICLE,
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
  DELETE_ARTICLE,
} from "../mutations";
import {
  FIND_ARTICLES,
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
  FIND_ARTICLE_BY_MOST_DISLIKED,
  GET_USER_BY_ID,
} from "../queries";
import { FindArticlesQuery } from "../gql/graphql";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import {
  showArticleCreatedToast,
  showArticleDeletedToast,
  showEmptyContentToast,
  showLoginRequiredToast,
} from "../utils/customToasts";
import UserIcon from "../components/UserIcon";
import ImageUploader from "../components/ImageUploader";

function PublicationPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;
  const navigate = useNavigate();

  // Obtenir les informations utilisateur, y compris l'icône
  const { data: userData, refetch: refetchUserData } = useQuery(
    GET_USER_BY_ID,
    {
      variables: { id: user?.id! },
      skip: !user?.id,
    }
  );

  const userIconName = userData?.findUserById?.iconName || "Skull";

  const {
    data,
    loading: articlesLoading,
    refetch: refetchArticles,
  } = useQuery(FIND_ARTICLES, {
    fetchPolicy: "cache-and-network", // Utilise le cache et met à jour en arrière-plan
    nextFetchPolicy: "cache-first", // Utilise le cache pour les requêtes suivantes
  });
  const articles = data?.findArticles || [];

  // État pour suivre si un rafraîchissement est nécessaire
  const [needsRefresh, setNeedsRefresh] = useState(true);

  // Effet au chargement pour rafraîchir les données seulement si nécessaire
  useEffect(() => {
    if (needsRefresh) {
      // Utiliser un délai pour éviter de bloquer le rendu initial
      const timer = setTimeout(() => {
        refetchArticles();
        if (user?.id) {
          refetchUserData();
        }
        setNeedsRefresh(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [refetchArticles, refetchUserData, user?.id, needsRefresh]);

  const {
    data: mostDislikedArticles,
    loading: mostDislikedLoading,
    refetch: refetechMostDislikedArticles,
  } = useQuery(FIND_ARTICLE_BY_MOST_DISLIKED, {
    fetchPolicy: "cache-and-network", // Utilise le cache et met à jour en arrière-plan
    nextFetchPolicy: "cache-first", // Utilise le cache pour les requêtes suivantes
  });
  const mostDisliked = mostDislikedArticles?.findArticleByMostDisliked || [];

  type ArticleType = NonNullable<
    NonNullable<FindArticlesQuery["findArticles"]>[number]
  >;

  const [sortOption, setSortOption] = useState("recent");
  const displayedArticles: ArticleType[] = (
    sortOption === "recent" ? articles : mostDisliked
  ).filter((article): article is ArticleType => article !== null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(10);

  const { searchTerm } = useSearch();

  // Utiliser useMemo pour mémoriser les articles filtrés
  const filteredArticles = useMemo(() => {
    return searchTerm.trim()
      ? displayedArticles.filter((article) => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const titleMatch = article?.title
            ? article.title.toLowerCase().includes(lowerSearchTerm)
            : false;
          const contentMatch = article.content
            ? article.content.toLowerCase().includes(lowerSearchTerm)
            : false;
          const authorMatch = article.author.username
            .toLowerCase()
            .includes(lowerSearchTerm);
          return titleMatch || contentMatch || authorMatch;
        })
      : displayedArticles;
  }, [displayedArticles, searchTerm]);

  // Mémoriser les articles à afficher sur la page courante
  const currentArticles = useMemo(() => {
    return filteredArticles.slice(
      (currentPage - 1) * articlesPerPage,
      currentPage * articlesPerPage
    );
  }, [filteredArticles, currentPage, articlesPerPage]);

  // Mémoriser si des articles sont disponibles
  const hasArticles = useMemo(
    () => filteredArticles.length > 0,
    [filteredArticles]
  );

  // Mémoriser le nombre total de pages
  const totalPages = useMemo(
    () => Math.ceil(filteredArticles.length / articlesPerPage),
    [filteredArticles, articlesPerPage]
  );

  // Gérer le changement de page
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const [createArticle, { loading: isCreatingArticle }] =
    useMutation(CREATE_ARTICLE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ajoutez cette nouvelle variable d'état pour gérer l'article en cours de création
  const [tempArticleId, setTempArticleId] = useState<string | null>(null);
  const [tempArticleData, setTempArticleData] = useState<{
    title: string;
    content: string;
    imageUrl: string | null;
  }>({
    title: "",
    content: "",
    imageUrl: null,
  });

  const handleCreateArticle = async () => {
    if (!user) {
      showLoginRequiredToast("publish");
      return;
    }

    if (content.trim() === "") {
      showEmptyContentToast();
      return;
    }

    try {
      // Générer des datas temporaires pour l'article en cours de création
      setTempArticleId(`temp-${Date.now()}`);
      setTempArticleData({ title: title.trim(), content, imageUrl });

      const response = await createArticle({
        variables: {
          title: title.trim() || null,
          content,
          imageUrl,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.createArticle?.success) {
        setTitle("");
        setContent("");
        setImageUrl(null);

        // Indique que le rafraîchissement est en cours
        setIsRefreshing(true);

        // Rafraîchir uniquement les articles récents
        await refetchArticles();

        // Rafraîchir les articles les plus dislikés seulement si nécessaire
        if (sortOption === "popular") {
          setTimeout(() => {
            refetechMostDislikedArticles();
          }, 1000);
        }

        // Si on n'est pas sur la première page, y retourner pour voir le nouvel article
        if (currentPage > 1) {
          setCurrentPage(1);
        }

        // Indiquer que le rafraîchissement est terminé
        setIsRefreshing(false);
        setTempArticleId(null);
        setTempArticleData({ title: "", content: "", imageUrl: null });

        showArticleCreatedToast();
        console.log("Article créé avec succès !");
      } else {
        console.error(
          response?.data?.createArticle?.message ||
            "Echec de la création de l'article:"
        );
        setTempArticleId(null); // Supprimer l'article temporaire en cas d'échec
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
      setIsRefreshing(false);
      setTempArticleId(null);
      setTempArticleData({ title: "", content: "", imageUrl: null });
    }
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/publications/${articleId}?edit=true`);
  };

  const [showMenu, setShowMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [deleteArticle] = useMutation(DELETE_ARTICLE);

  const [deletedArticleIds, setDeletedArticleIds] = useState<string[]>([]);

  const handleDeleteArticle = async (articleId: string) => {
    setDeletedArticleIds((prev) => [...prev, articleId]);
    showArticleDeletedToast();

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
        if (sortOption === "popular") {
          await refetechMostDislikedArticles();
        } else {
          await refetchArticles();
        }
        console.log("Article supprimé avec succès !");
      } else {
        console.error(
          response?.data?.deleteArticle?.message ||
            "Echec de la suppression de l'article."
        );
        setDeletedArticleIds((prev) => prev.filter((id) => id !== articleId));
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
      setDeletedArticleIds((prev) => prev.filter((id) => id !== articleId));
    }
  };

  const handlePostClick = (articleId: string) => {
    navigate(`/publications/${articleId}`);
  };

  const { data: dislikeUser, refetch: refetchDislikeUser } = useQuery(
    FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
    {
      variables: { userId: user?.id! },
      skip: !user?.id,
    }
  );

  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Met à jour userDislikes en fonction des articles et des dislikes de l'utilisateur
  useEffect(() => {
    if (!user) {
      if (Object.keys(userDislikes).length !== 0) {
        setUserDislikes({});
      }
      return;
    }

    const dislikesMap: { [key: string]: boolean } = {};

    // Vérifie les articles dislikés dans displayedArticles
    displayedArticles.forEach(({ id, dislikes = [] }) => {
      if (dislikes?.some((dislike) => dislike?.user?.id === user?.id)) {
        dislikesMap[id] = true;
      }
    });

    // Vérifie les dislikes récupérés depuis la requête GraphQL
    if (dislikeUser?.getDislikesByUserIdForArticles) {
      dislikeUser.getDislikesByUserIdForArticles.forEach((dislike) => {
        if (dislike?.article) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }

    setUserDislikes(dislikesMap);
  }, [articles, mostDisliked, dislikeUser, user?.id, sortOption]);

  const [addDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  const handleDislike = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();

    if (!articleId) {
      console.error("ID article manquant !");
      return;
    }

    if (!user) {
      showLoginRequiredToast("dislike");
      return;
    }

    try {
      // Mettre à jour l'état local immédiatement pour une réponse instantanée
      const newDislikeState = !userDislikes[articleId];
      setUserDislikes((prev) => ({
        ...prev,
        [articleId]: newDislikeState,
      }));

      // Mettre à jour visuellement le compteur de dislikes
      const articleElement = document.querySelector(
        `[data-article-id="${articleId}"]`
      );
      if (articleElement) {
        const dislikeCountElement =
          articleElement.querySelector(".dislike-count");
        if (dislikeCountElement) {
          const currentCount = parseInt(
            dislikeCountElement.textContent || "0",
            10
          );
          dislikeCountElement.textContent = String(
            newDislikeState ? currentCount + 1 : currentCount - 1
          );
        }
      }

      if (newDislikeState) {
        // Ajoute le dislike
        await addDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a disliké l'article.");
      } else {
        // Supprime le dislike
        await deleteDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a retiré son dislike.");
      }

      // Rafraîchir uniquement les données de dislike de l'utilisateur
      // sans recharger tous les articles
      await refetchDislikeUser();

      // Planifier un rafraîchissement différé des articles pour éviter
      // de bloquer l'interface utilisateur
      setTimeout(() => {
        if (sortOption === "popular") {
          refetechMostDislikedArticles();
        }
      }, 2000);
    } catch (error) {
      // En cas d'erreur, remettre l'état précédent
      setUserDislikes((prev) => ({
        ...prev,
        [articleId]: !userDislikes[articleId],
      }));
      console.error("Erreur lors de l'ajout/suppression du dislike :", error);
    }
  };

  // Fonction pour partager un article
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

  // Vérifier si les données sont en cours de chargement
  const isLoading = articlesLoading || mostDislikedLoading;

  // Afficher le loader pendant le chargement des données
  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-400">Publications</h2>
        <div className="relative flex items-center">
          <SortDesc className="absolute left-3 text-gray-500 h-4 w-4" />
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              console.log("Nouveau tri : ", e.target.value);
            }}
            className="bg-gray-800 text-gray-300 px-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
          >
            <option value="recent">Les plus récentes</option>
            <option value="popular">Les plus impopulaires</option>
          </select>
          <div className="absolute right-3 pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>
      {/* Créer un article */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-4 mb-8 border border-purple-900"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
              {user ? (
                <UserIcon iconName={userIconName} size="small" />
              ) : (
                <Skull className="h-6 w-6 text-purple-400" />
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-4 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              placeholder="Titre de l'article (Optionnel)"
            />
            <textarea
              placeholder="Partagez vos pensées les plus sombres..."
              className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Ajout du téléchargeur d'image */}
            <ImageUploader imageUrl={imageUrl} onImageChange={setImageUrl} />

            <div className="flex flex-col w-full">
              <div className="flex justify-end mt-3">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center space-x-2"
                  onClick={handleCreateArticle}
                  disabled={isCreatingArticle || isRefreshing}
                >
                  {isCreatingArticle ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Publication en cours...</span>
                    </>
                  ) : (
                    <span>Publier</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Articles List */}
      <div className="space-y-10">
        {/* Article temporaire en cours de création */}
        {tempArticleId && (
          <motion.div
            key={tempArticleId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6 border border-purple-900 relative overflow-hidden min-h-28"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                  <UserIcon iconName={userIconName} size="small" />
                </div>
                <div>
                  <h3 className="text-purple-400 font-semibold">
                    {user?.username}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Le {new Date().toLocaleString().replace(" ", " à ")}
                  </p>
                </div>
              </div>
            </div>

            {tempArticleData.title && <h2>{tempArticleData.title}</h2>}

            <p className="text-gray-300 mb-4 whitespace-pre-wrap">
              {tempArticleData.content}
            </p>

            {tempArticleData.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={tempArticleData.imageUrl}
                  alt="Article en cours de publication"
                  className="w-full h-auto rounded-lg max-h-80 object-cover"
                />
              </div>
            )}

            {/* Overlay de chargement */}
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto mb-4 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-purple-400 font-medium">
                  Publication en cours...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {hasArticles ? (
          currentArticles
            .filter(
              (article) =>
                article !== null && !deletedArticleIds.includes(article.id)
            )
            .map(
              ({
                id: articleId,
                title,
                content,
                imageUrl, // Ajout de imageUrl
                author,
                createdAt,
                updatedAt,
                TotalDislikes,
                TotalComments,
              }) => (
                <motion.div
                  key={articleId}
                  data-article-id={articleId}
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
                  className="bg-gray-900 rounded-lg p-6 border border-purple-900 cursor-pointer hover:border-purple-700 transition-colors"
                  onClick={() => handlePostClick(articleId)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                        <UserIcon iconName={author.iconName} size="small" />
                      </div>
                      <div>
                        <h3 className="text-purple-400 font-semibold">
                          {author.username}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Le {""}
                          {updatedAt
                            ? new Date(parseInt(updatedAt, 10))
                                .toLocaleString()
                                .replace(" ", " à ")
                            : new Date(parseInt(createdAt ?? "0", 10))
                                .toLocaleString()
                                .replace(" ", " à ")}
                        </p>
                      </div>
                    </div>

                    {author.id === user?.id && (
                      <div className="relative">
                        <button
                          className="text-gray-500 hover:text-purple-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(
                              articleId === showMenu ? null : articleId
                            );
                          }}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMenu === articleId && (
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
                                handleDeleteArticle(articleId);
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
                                handleEditArticle(articleId);
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
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-purple-400 mb-2">
                    {title}
                  </h2>

                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                    {content}
                  </p>

                  {/* Affichage de l'image si elle existe */}
                  {imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Article"
                        className="w-full h-auto rounded-lg max-h-80 object-cover"
                        loading="lazy"
                        width="800"
                        height="450"
                        decoding="async"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center space-x-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 hover:text-purple-400 ${
                          user && userDislikes[articleId]
                            ? "text-purple-400"
                            : "text-gray-500"
                        }`}
                        onClick={(e) => handleDislike(e, articleId)}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span className="dislike-count">{TotalDislikes}</span>
                      </motion.button>

                      <button
                        className="flex items-center space-x-2 hover:text-purple-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostClick(articleId);
                        }}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{TotalComments}</span>
                      </button>
                    </div>

                    <button
                      className="flex items-center space-x-2 hover:text-purple-400"
                      onClick={(e) => handleShareArticle(e, articleId)}
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Partager</span>
                    </button>
                  </div>
                </motion.div>
              )
            )
        ) : (
          <p className="text-center text-gray-400">Aucun article trouvé.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevPage}
          disabled={!hasArticles || currentPage === 1}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={!hasArticles || currentPage === totalPages}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </main>
  );
}

export default PublicationPage;
