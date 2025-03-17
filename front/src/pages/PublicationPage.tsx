import React, { use, useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ThumbsDown,
  MessageSquare,
  Share2,
  Skull,
  MoreVertical,
  Megaphone,
  SortDesc,
  Trash2,
  Edit2,
  FilterIcon,
  Bomb,
  Flame,
} from "lucide-react";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@apollo/client";
import { AuthContext } from "../context/AuthContext";
import {
  CREATE_ARTICLE,
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
  DELETE_ARTICLE,
} from "../mutations";
import {
  FIND_ARTICLES,
  FIND_DISLIKES_BY_USER_ID,
  FIND_ARTICLE_BY_MOST_DISLIKED,
} from "../queries";
import { FindArticlesQuery } from "../gql/graphql";

function PublicationPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;

  const isNotLogin = (action: "dislike" | "publish") => {
    const messages = {
      dislike: [
        "Tu veux semer le chaos ? Connecte-toi d'abord, rebelle.",
        "Pas de dislike sans identité... Connecte-toi et libère ta haine.",
        "L'anarchie a ses règles : connecte-toi pour disliker.",
        "Tu crois pouvoir disliker incognito ? Rejoins le désordre connecté.",
      ],
      publish: [
        "Pas de publication sans identité... Connecte-toi et crée du chaos.",
        "Les idées n'ont pas de visage sans connexion... Connecte-toi pour publier.",
        "Pour faire entendre ta voix, tu dois être connecté.",
        "Rejoins le mouvement, publie ton cri dans le néant après t'être connecté.",
      ],
    };

    const randomMessage =
      messages[action][Math.floor(Math.random() * messages[action].length)];
    toast.warn(randomMessage);
  };

  const navigate = useNavigate();

  const { data, refetch: refetchArticles } = useQuery(FIND_ARTICLES);
  const articles = data?.findArticles || [];

  const { data: mostDislikedArticles } = useQuery(
    FIND_ARTICLE_BY_MOST_DISLIKED
  );
  const mostDisliked = mostDislikedArticles?.findArticleByMostDisliked || [];

  type ArticleType = NonNullable<
    NonNullable<FindArticlesQuery["findArticles"]>[number]
  >;

  const [sortOption, setSortOption] = useState("recent");
  const displayedArticles: ArticleType[] =
    sortOption === "recent" ? articles : mostDisliked;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [createArticle] = useMutation(CREATE_ARTICLE, {
    variables: { title, content },
  });

  const handleCreateArticle = async () => {
    if (!user) {
      isNotLogin("publish");
      return;
    }

    try {
      const response = await createArticle({
        variables: {
          title,
          content,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.createArticle?.success) {
        toast.success(
          "Un nouveau cri dans le néant. Ton article est en ligne.",
          {
            icon: <Megaphone size={24} color="#f0aaff" />,
          }
        );
        console.log("Article created successfully!");

        await refetchArticles();

        setTitle("");
        setContent("");
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
        toast.success("Bam! Article vaporisé ! 💥", {
          icon: <Bomb size={24} color="#f0aaff" />,
          style: { background: "#2a0134", color: "#f0aaff" },
        });
        await refetchArticles();
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

  const { data: dislikeUser, refetch } = useQuery(FIND_DISLIKES_BY_USER_ID, {
    variables: { userId: user?.id! },
    skip: !user?.id,
  });

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

    // Vérifie les articles dislikés dans sortedArticles
    displayedArticles.forEach(({ id, dislikes = [] }) => {
      if (dislikes?.some((dislike) => dislike?.user?.id === user?.id)) {
        dislikesMap[id] = true;
      }
    });

    // Vérifie les dislikes récupérés depuis la requête GraphQL
    if (dislikeUser?.getDislikesByUserId) {
      dislikeUser.getDislikesByUserId.forEach(({ article }) => {
        dislikesMap[article.id] = true;
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
      isNotLogin("dislike");
      return;
    }

    try {
      if (userDislikes[articleId]) {
        // Supprime le dislike
        await deleteDislike({ variables: { articleId, userId: user.id! } });
        setUserDislikes((prev) => ({ ...prev, [articleId]: false }));
        console.log(user.username, "a retiré son dislike.");
      } else {
        // Ajoute le dislike
        await addDislike({ variables: { articleId, userId: user.id! } });
        setUserDislikes((prev) => ({ ...prev, [articleId]: true }));
        console.log(user.username, "a disliké l'article.");
      }
      await refetch();
      await refetchArticles();
      console.log("Dislikes mis à jour.", userDislikes);
    } catch (error) {
      console.error("Erreur lors de l'ajout/suppression du dislike :", error);
    }
  };

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
            <option value="popular">Les plus populaires</option>
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
              <Skull className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="flex-grow">
            <textarea
              placeholder="Partagez vos pensées les plus sombres..."
              className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
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
        {displayedArticles
          .filter((article) => article !== null)
          .map(
            ({
              id: articleId,
              title,
              content,
              author,
              createdAt,
              updatedAt,
              TotalDislikes,
              TotalComments,
            }) => (
              <motion.div
                key={articleId}
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
                      <Skull className="h-6 w-6 text-purple-400" />
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
                            className="flex items-center space-x-2 text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span>Supprimer</span>
                          </button>
                          <hr className="border-gray-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Gérer la modification
                              setShowMenu(null);
                            }}
                            className="flex items-center space-x-2 text-purple-500 hover:text-purple-400"
                          >
                            <Edit2 className="h-5 w-5" />
                            <span>Modifier</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-semibold text-gray-100 mb-4">
                  {title}
                </h1>

                <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                  {content}
                </p>

                <div className="flex items-center space-x-6 text-gray-500">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 ${
                      user && userDislikes[articleId]
                        ? "text-purple-400"
                        : "text-gray-500"
                    }`}
                    onClick={(e) => handleDislike(e, articleId)}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span>{TotalDislikes}</span>
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

                  <button
                    className="flex items-center space-x-2 hover:text-purple-400"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )
          )}
      </div>
    </main>
  );
}

export default PublicationPage;
