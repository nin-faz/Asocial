import React, { useContext, useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_ARTICLE_DISLIKE,
  CREATE_ARTICLE,
  DELETE_ARTICLE_DISLIKE,
} from "../gql/mutations";
import { FIND_ARTICLE_BY_MOST_DISLIKED, FIND_ARTICLES } from "../gql/queries";
import { AuthContext } from "../context/AuthContext";

interface CreateArticleResponse {
  createArticle: {
    success: boolean;
    message: string;
    article: Article;
  };
}

interface Article {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: {
    username: string;
  };
  dislikes?: Dislike[];
  comments?: Comment[];
  NbOfDislikes?: number;
}

interface Dislike {
  id: string;
  user: {
    id: string;
    username: string;
  };
}

interface FindArticleByMostDislikedData {
  findArticleByMostDisliked: {
    id: string;
    title?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    author: {
      id: string;
      username: string;
    };
    dislikes: {
      id: string;
      user: {
        id: string;
        username: string;
      };
    }[];
    _count: {
      dislikes: number;
    };
  }[];
}

interface FindArticlesData {
  findArticles: {
    id: string;
    title?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    NbOfDislikes?: number;
    author: {
      id: string;
      username: string;
    };
    dislikes: Dislike[];
  }[];
}

function PublicationPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Set<string>>(
    new Set()
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [sortOption, setSortOption] = useState<string>("recent");

  const mostDislikedArticlesData = useQuery<FindArticleByMostDislikedData>(
    FIND_ARTICLE_BY_MOST_DISLIKED,
    { skip: sortOption !== "popular" }
  );

  const dataArticles = useQuery<FindArticlesData>(FIND_ARTICLES);

  const articlesList =
    sortOption === "popular"
      ? mostDislikedArticlesData.data?.findArticleByMostDisliked
      : dataArticles.data?.findArticles;

  useEffect(() => {
    if (articlesList) {
      let sortedArticles;

      if (sortOption !== "popular") {
        // Tri des articles par date lorsque sortOption n'est pas "popular"
        sortedArticles = [...(dataArticles.data?.findArticles || [])].sort(
          (a, b) => {
            const dateA = a.updatedAt
              ? new Date(parseInt(a.updatedAt, 10))
              : new Date(parseInt(a.createdAt, 10));
            const dateB = b.updatedAt
              ? new Date(parseInt(b.updatedAt, 10))
              : new Date(parseInt(b.createdAt, 10));

            return dateB.getTime() - dateA.getTime();
          }
        );
      } else {
        // Articles populaires
        sortedArticles =
          mostDislikedArticlesData.data?.findArticleByMostDisliked || [];
      }

      setArticles(sortedArticles);

      // Gérer les dislikes de l'utilisateur
      if (user) {
        const dislikesMap: Record<string, boolean> = {};
        sortedArticles.forEach((article) => {
          dislikesMap[article.id] =
            article.dislikes?.some(
              (dislike: Dislike) => dislike.user.id === user.id
            ) ?? false;
        });
        setUserDislikes(dislikesMap);
      }

      // Mise à jour de popularArticles si tri par popularité
      if (sortOption === "popular") {
        const popularArticleIds = new Set<string>();
        sortedArticles.forEach((article) => {
          popularArticleIds.add(article.id);
        });
        setPopularArticles(popularArticleIds);
      }
    }
  }, [dataArticles, user, sortOption]);

  const handlePostClick = (postId: string) => {
    navigate(`/publications/${postId}`);
  };

  console.log("user : ", user);

  const [addArticleDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteArticleDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  const [userDislikes, setUserDislikes] = useState<Record<string, boolean>>({});

  const handleDislike = async (articleId: string) => {
    if (!token || !user) {
      toast.error("Vous devez être connecté pour disliker un article.");
      return;
    }

    try {
      if (userDislikes[articleId]) {
        await deleteArticleDislike({
          variables: { articleId, userId: user.id },
          context: { headers: { Authorization: `Bearer ${token}` } },
        });
        toast.info("Dislike retiré.");

        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.id === articleId
              ? {
                  ...article,
                  dislikes: (article.dislikes || []).filter(
                    (dislike) => dislike.user.id !== user.id
                  ),
                }
              : article
          )
        );
      } else {
        const { data } = await addArticleDislike({
          variables: { articleId, userId: user.id },
          context: { headers: { Authorization: `Bearer ${token}` } },
        });
        if (data) {
          toast.success("Dislike ajouté.");
          const newDislike = {
            id: data.addArticleDislike.id,
            user: { id: user.id!, username: user.username },
          };

          setArticles((prevArticles) =>
            prevArticles.map((article) =>
              article.id === articleId
                ? {
                    ...article,
                    dislikes: [...(article.dislikes || []), newDislike],
                  }
                : article
            )
          );
        }
      }

      // Mettre à jour l'état du dislike pour cet article
      setUserDislikes((prev) => ({
        ...prev,
        [articleId]: !prev[articleId],
      }));
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de la gestion du dislike.");
    }
  };

  const [createArticle] = useMutation<CreateArticleResponse>(CREATE_ARTICLE);

  const handleCreateArticle = async () => {
    if (!token) {
      toast.error("Vous devez être connecté pour publier un article.");
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

        setArticles((prevArticles) => [
          response.data!.createArticle.article,
          ...prevArticles,
        ]);

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
              console.log(e.target.value); // Affiche la nouvelle valeur de sortOption
            }}
            className="bg-gray-800 text-gray-300 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
          >
            <option value="recent">Les plus récentes</option>
            <option value="popular">Les plus détestées</option>
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
        {articles.map((articleData) => (
          <motion.div
            key={articleData.id}
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
            onClick={() => handlePostClick(articleData.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                  <Skull className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-purple-400 font-semibold">
                    {articleData.author.username}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {articleData.updatedAt
                      ? new Date(
                          parseInt(articleData.updatedAt, 10)
                        ).toLocaleString()
                      : new Date(
                          parseInt(articleData.createdAt, 10)
                        ).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-500 hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-300 mb-4 whitespace-pre-wrap">
              {articleData.content}
            </p>

            <div className="flex items-center space-x-6 text-gray-500">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 ${
                  userDislikes[articleData.id]
                    ? "text-purple-400"
                    : "text-gray-500"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDislike(articleData.id);
                }}
              >
                <ThumbsDown className="h-5 w-5" />
                <span>{articleData?.NbOfDislikes}</span>
              </motion.button>

              <button
                className="flex items-center space-x-2 hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(articleData.id);
                }}
              >
                <MessageSquare className="h-5 w-5" />
                <span>{articleData?.comments?.length}</span>
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
        ))}
      </div>
    </main>
  );
}

export default PublicationPage;
