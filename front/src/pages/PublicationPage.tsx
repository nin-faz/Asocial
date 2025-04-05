import { useContext, useEffect, useRef, useState } from "react";
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
    fetchPolicy: "network-only", // Force le rafraîchissement depuis le serveur
  });
  const articles = data?.findArticles || [];

  // Effet au chargement pour rafraîchir les données
  useEffect(() => {
    refetchArticles();
    if (user?.id) {
      refetchUserData();
    }
  }, [refetchArticles, refetchUserData, user?.id]);

  const {
    data: mostDislikedArticles,
    loading: mostDislikedLoading,
    refetch: refetechMostDislikedArticles,
  } = useQuery(FIND_ARTICLE_BY_MOST_DISLIKED);
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
  const [articlesPerPage] = useState(5);

  const { searchTerm } = useSearch();

  const filteredArticles = searchTerm.trim()
    ? displayedArticles.filter((article) => {
        const titleMatch = article?.title
          ? article.title.toLowerCase().includes(searchTerm.toLowerCase())
          : false;
        const contentMatch = article.content
          ? article.content.toLowerCase().includes(searchTerm.toLowerCase())
          : false;
        const authorMatch = article.author.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return titleMatch || contentMatch || authorMatch;
      })
    : displayedArticles;

  // Récupérer les articles à afficher sur la page courante
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const hasArticles = filteredArticles.length > 0;

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  // Gérer le changement de page
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const [createArticle] = useMutation(CREATE_ARTICLE);

  const handleCreateArticle = async () => {
    if (!user) {
      showLoginRequiredToast("publish");
      return;
    }

    if (content.trim() === "") {
      toast.error("Le contenu de l'article ne peut pas être vide");
      return;
    }

    try {
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
        showArticleCreatedToast();
        console.log("Article créé avec succès !");

        await refetchArticles();
        await refetechMostDislikedArticles();

        setTitle("");
        setContent("");
        setImageUrl(null);
      } else {
        console.error(
          response?.data?.createArticle?.message ||
            "Echec de la création de l'article:"
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
      setUserDislikes({});
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

      // Rafraîchir les données après l'opération
      await refetchDislikeUser();
      await refetchArticles();
      await refetechMostDislikedArticles();
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

            <div className="flex justify-end mt-3">
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                onClick={handleCreateArticle}
              >
                Publier
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Articles List */}
      <div className="space-y-10">
        {hasArticles ? (
          currentArticles
            .filter((article) => article !== null)
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
