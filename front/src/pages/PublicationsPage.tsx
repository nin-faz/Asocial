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
} from "lucide-react";

import { useQuery, useMutation } from "@apollo/client";
import { FIND_ARTICLES } from "../gql/queries";
import { CREATE_ARTICLE } from "../gql/mutations";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

interface CreateArticleResponse {
  createArticle: {
    success: boolean;
    message: string;
    article: {
      id: string;
      title?: string;
      content: string;
      createdAt: string;
      updatedAt?: string;
      author: {
        username: string;
      };
      dislikes: number;
      comments: number;
    };
  };
}

const mockArticles: CreateArticleResponse[] = [
  {
    createArticle: {
      success: true,
      message: "Article has been created",
      article: {
        id: "1",
        title: "Réflexion sur la société",
        content:
          "La société n'est qu'une illusion collective que nous maintenons par peur du vide. #Nihilisme",
        createdAt: "2024-02-27T12:00:00Z",
        updatedAt: "2024-02-27T14:00:00Z",
        author: {
          username: "ChaosLord",
        },
        dislikes: 666,
        comments: 13,
      },
    },
  },
  {
    createArticle: {
      success: true,
      message: "Article has been created",
      article: {
        id: "2",
        title: "Solitude et Humanité",
        content:
          "Plus je côtoie les humains, plus j'apprécie ma solitude. Les réseaux sociaux sont la preuve de notre décadence collective.",
        createdAt: "2024-02-27T08:30:00Z",
        updatedAt: "2024-02-27T09:00:00Z",
        author: {
          username: "DarkPhilosopher",
        },
        dislikes: 421,
        comments: 42,
        // image:
        //   "https://images.unsplash.com/photo-1516410529446-2c777cb7366d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
    },
  },
  {
    createArticle: {
      success: true,
      message: "Article has been created",
      article: {
        id: "3",
        title: "La tyrannie de l'approbation",
        content:
          "Vos likes sont le symbole de votre besoin pathétique d'approbation. Ici, nous célébrons la désapprobation. 🖤",
        createdAt: "2024-02-27T15:00:00Z",
        updatedAt: "2024-02-27T16:30:00Z",
        author: {
          username: "DigitalAnarchist",
        },
        dislikes: 1337,
        comments: 89,
      },
    },
  },
];

function PublicationPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token } = authContext;

  const [articles, setArticles] = useState<
    CreateArticleResponse["createArticle"]["article"][]
  >(mockArticles.map((m) => m.createArticle.article));

  const navigate = useNavigate();

  //   const handleDislike = (postId: number) => {
  //     setArticles(
  //       articles.map((article) =>
  //         article.id === postId ? { ...article, dislikes: article.dislikes + 1 } : article
  //       )
  //     );
  //   };

  const handlePostClick = (postId: string) => {
    navigate(`/publications/${postId}`);
  };

  const [createArticle] = useMutation<CreateArticleResponse>(CREATE_ARTICLE);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

      // Gérer la réponse de la mutation
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

  const { data, loading, error } = useQuery(FIND_ARTICLES);

  useEffect(() => {
    if (data?.findArticles) {
      const sortedArticles = [...data.findArticles, ...mockArticles].sort(
        (a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        }
      );

      setArticles(sortedArticles);
    }
  }, [data]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Create Article Section */}
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
            {/* Article Header */}
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
                    {articleData.createdAt}
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

            {/* Article Content */}
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">
              {articleData.content}
            </p>

            {/* Article Image */}
            {/* {articleData.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={articleData.image}
                  alt="Article"
                  className="w-full h-auto"
                />
              </div>
            )} */}

            {/* Article Actions */}
            <div className="flex items-center space-x-6 text-gray-500">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                // onClick={(e) => {
                //   e.stopPropagation();
                //   handleDislike(articleData.id);
                // }}
                className="flex items-center space-x-2 hover:text-purple-400"
              >
                <ThumbsDown className="h-5 w-5" />
                <span>{articleData.dislikes}</span>
              </motion.button>

              <button
                className="flex items-center space-x-2 hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(articleData.id);
                }}
              >
                <MessageSquare className="h-5 w-5" />
                <span>{articleData.comments}</span>
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
