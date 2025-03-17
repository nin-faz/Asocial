import React, { use, useContext, useEffect, useState } from "react";
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
// import { FIND_ARTICLE_BY_MOST_DISLIKED, FIND_ARTICLES } from "../gql/queries";
import { AuthContext } from "../context/AuthContext";
import {
  CREATE_ARTICLE,
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
} from "../mutations";
import { FIND_ARTICLES, FIND_DISLIKES_BY_USER_ID } from "../queries";

import { graphql } from "../gql";

// const CREATE_ARTICLE = graphql(`
//   mutation CreateArticle($title: String, $content: String!) {
//     createArticle(title: $title, content: $content) {
//       code
//       success
//       message
//       article {
//         id
//         title
//         content
//         createdAt
//         updatedAt
//         author {
//           id
//           username
//         }
//       }
//     }
//   }
// `);

// interface Article {
//   id: string;
//   title?: string;
//   content: string;
//   createdAt: string;
//   updatedAt?: string;
//   author: {
//     username: string;
//   };
//   dislikes?: Dislike[];
//   comments?: Comment[];
//   TotalDislikes?: number;
// }

// interface Dislike {
//   id: string;
//   user: {
//     id: string;
//     username: string;
//   };
// }

// interface FindArticleByMostDislikedData {
//   findArticleByMostDisliked: {
//     id: string;
//     title?: string;
//     content: string;
//     createdAt: string;
//     updatedAt?: string;
//     author: {
//       id: string;
//       username: string;
//     };
//     dislikes: {
//       id: string;
//       user: {
//         id: string;
//         username: string;
//       };
//     }[];
//     _count: {
//       dislikes: number;
//     };
//   }[];
// }

// interface FindArticlesData {
//   findArticles: {
//     id: string;
//     title?: string;
//     content: string;
//     createdAt: string;
//     updatedAt?: string;
//     TotalDislikes?: number;
//     author: {
//       id: string;
//       username: string;
//     };
//     dislikes: Dislike[];
//   }[];
// }

function PublicationPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;

  const navigate = useNavigate();

  // const [articles] = useQuery(FIND_ARTICLES);
  const {
    data,
    loading,
    error,
    refetch: refetchArticles,
  } = useQuery(FIND_ARTICLES);

  const articles = data?.findArticles || [];

  const [sortedArticles, setSortedArticles] = useState([]);

  useEffect(() => {
    if (articles) {
      console.log("Articles récupérés:", articles); // Vérifie ce qui est récupéré

      // Copie les articles et trie les par date
      const sorted = [...articles].sort((a, b) => {
        // Assure-toi que les dates existent et sont valides
        const dateA = a?.updatedAt
          ? new Date(parseInt(a.updatedAt, 10))
          : a?.createdAt
          ? new Date(parseInt(a.createdAt, 10))
          : new Date(0); // Date par défaut si pas de date

        const dateB = b?.updatedAt
          ? new Date(parseInt(b.updatedAt, 10))
          : b?.createdAt
          ? new Date(parseInt(b.createdAt, 10))
          : new Date(0); // Date par défaut si pas de date

        return dateB.getTime() - dateA.getTime(); // Tri décroissant
      });

      // Mets à jour l'état avec les articles triés
      setSortedArticles(sorted);
    }
  }, [data]);

  // const [popularArticles, setPopularArticles] = useState<Set<string>>(
  //   new Set()
  // );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // const [sortOption, setSortOption] = useState<string>("recent");

  // const mostDislikedArticlesData = useQuery<FindArticleByMostDislikedData>(
  //   FIND_ARTICLE_BY_MOST_DISLIKED,
  //   { skip: sortOption !== "popular" }
  // );

  // const dataArticles = useQuery<FindArticlesData>(FIND_ARTICLES);

  // const articlesList =
  //   sortOption === "popular"
  //     ? mostDislikedArticlesData.data?.findArticleByMostDisliked
  //     : dataArticles.data?.findArticles;

  // useEffect(() => {
  //   if (articlesList) {
  //     let sortedArticles;

  //     if (sortOption !== "popular") {
  //       // Tri des articles par date lorsque sortOption n'est pas "popular"
  //       sortedArticles = [...(dataArticles.data?.findArticles || [])].sort(
  //         (a, b) => {
  //           const dateA = a.updatedAt
  //             ? new Date(parseInt(a.updatedAt, 10))
  //             : new Date(parseInt(a.createdAt, 10));
  //           const dateB = b.updatedAt
  //             ? new Date(parseInt(b.updatedAt, 10))
  //             : new Date(parseInt(b.createdAt, 10));

  //           return dateB.getTime() - dateA.getTime();
  //         }
  //       );
  //     } else {
  //       // Articles populaires
  //       sortedArticles =
  //         mostDislikedArticlesData.data?.findArticleByMostDisliked || [];
  //     }

  //     setArticles(sortedArticles);

  //     // Gérer les dislikes de l'utilisateur
  //     if (user) {
  //       const dislikesMap: Record<string, boolean> = {};
  //       sortedArticles.forEach((article) => {
  //         dislikesMap[article.id] =
  //           article.dislikes?.some(
  //             (dislike: Dislike) => dislike.user.id === user.id
  //           ) ?? false;
  //       });
  //       setUserDislikes(dislikesMap);
  //     }

  //     // Mise à jour de popularArticles si tri par popularité
  //     if (sortOption === "popular") {
  //       const popularArticleIds = new Set<string>();
  //       sortedArticles.forEach((article) => {
  //         popularArticleIds.add(article.id);
  //       });
  //       setPopularArticles(popularArticleIds);
  //     }
  //   }
  // }, [dataArticles, user, sortOption]);

  // const handlePostClick = (postId: string) => {
  //   navigate(`/publications/${postId}`);
  // };

  // console.log("user : ", user);

  // const [addArticleDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  // const [deleteArticleDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  // const handleDislike = async (articleId: string) => {
  //   if (!token || !user) {
  //     toast.error("Vous devez être connecté pour disliker un article.");
  //     return;
  //   }

  //   try {
  //     if (userDislikes[articleId]) {
  //       await deleteArticleDislike({
  //         variables: { articleId, userId: user.id },
  //         context: { headers: { Authorization: `Bearer ${token}` } },
  //       });
  //       toast.info("Dislike retiré.");

  //       setArticles((prevArticles) =>
  //         prevArticles.map((article) =>
  //           article.id === articleId
  //             ? {
  //                 ...article,
  //                 dislikes: (article.dislikes || []).filter(
  //                   (dislike) => dislike.user.id !== user.id
  //                 ),
  //               }
  //             : article
  //         )
  //       );
  //     } else {
  //       const { data } = await addArticleDislike({
  //         variables: { articleId, userId: user.id },
  //         context: { headers: { Authorization: `Bearer ${token}` } },
  //       });
  //       if (data) {
  //         toast.success("Dislike ajouté.");
  //         const newDislike = {
  //           id: data.addArticleDislike.id,
  //           user: { id: user.id!, username: user.username },
  //         };

  //         setArticles((prevArticles) =>
  //           prevArticles.map((article) =>
  //             article.id === articleId
  //               ? {
  //                   ...article,
  //                   dislikes: [...(article.dislikes || []), newDislike],
  //                 }
  //               : article
  //           )
  //         );
  //       }
  //     }

  //     // Mettre à jour l'état du dislike pour cet article
  //     setUserDislikes((prev) => ({
  //       ...prev,
  //       [articleId]: !prev[articleId],
  //     }));
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Une erreur est survenue lors de la gestion du dislike.");
  //   }
  // };

  const [createArticle] = useMutation(CREATE_ARTICLE, {
    variables: { title, content },
  });

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

        // setArticles((prevArticles) => [
        //   response.data!.createArticle.article,
        //   ...prevArticles,
        // ]);

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

  const { data: dislikeUser, refetch } = useQuery(FIND_DISLIKES_BY_USER_ID, {
    variables: { userId: user?.id! },
    skip: !user?.id,
  });

  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Met à jour userDislikes en fonction des articles et des dislikes de l'utilisateur
  useEffect(() => {
    const dislikesMap: { [key: string]: boolean } = {};

    // Vérifie les articles dislikés dans sortedArticles
    sortedArticles.forEach(({ id, dislikes = [] }) => {
      if (dislikes.some(({ userId }) => userId === user?.id)) {
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
  }, [sortedArticles, dislikeUser, user?.id]);

  const [addDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  const handleDislike = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();

    if (!articleId) {
      console.error("ID article manquant !");
      return;
    }

    if (!user) {
      toast.warn("Veuillez vous connecter pour disliker un article !");
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
          {/* <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              console.log(e.target.value); // Affiche la nouvelle valeur de sortOption
            }}
            className="bg-gray-800 text-gray-300 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
          >
            <option value="recent">Les plus récentes</option>
            <option value="popular">Les plus détestées</option>
          </select> */}
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
        {sortedArticles
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
                // onClick={() => handlePostClick(articleId)}
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
                          : new Date(parseInt(createdAt, 10))
                              .toLocaleString()
                              .replace(" ", " à ")}
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
                      userDislikes[articleId]
                        ? "text-purple-400"
                        : "text-gray-500"
                    }`}
                    onClick={(e) => handleDislike(e, articleId)}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span>
                      {
                        TotalDislikes
                        // + (userDislikes[articleId] ? 1 : 0)
                        // (userDislikes[articleId] &&
                        // !sortedArticles.some(({ dislikes }) =>
                        //   (dislikes || []).some(
                        //     ({ userId }: { userId: string }) =>
                        //       userId === user?.id
                        //   )
                        // )
                        //   ? 0
                        //   : 1)
                      }
                    </span>
                  </motion.button>

                  <button
                    className="flex items-center space-x-2 hover:text-purple-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      // handlePostClick(articleId);
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
