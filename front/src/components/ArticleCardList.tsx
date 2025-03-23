import { motion } from "framer-motion";
import {
  MoreVertical,
  Trash2,
  Edit2,
  Skull,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import { useRef } from "react";
import { Article } from "../gql/graphql";

type ArticleCardListProps = {
  articles: Article[];
  userId?: string;
  userDislikes: Record<string, boolean>;
  showMenu: string | null;
  setShowMenu: (id: string | null) => void;
  handleDeleteArticle: (id: string) => void;
  handleDislike: (e: React.MouseEvent, id: string) => void;
  handlePostClick: (id: string) => void;
  //   page?: "list" | "detail";
};

const ArticleCardList: React.FC<ArticleCardListProps> = ({
  articles,
  userId,
  userDislikes,
  showMenu,
  setShowMenu,
  handleDeleteArticle,
  handleDislike,
  handlePostClick,
  //   page = "list",
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  if (!articles.length) {
    return <p className="text-center text-gray-400">Aucun article trouvé.</p>;
  }

  return (
    <>
      {articles
        .filter((article) => article !== null)
        .map((article) => {
          const {
            id: articleId,
            title,
            content,
            author,
            createdAt,
            updatedAt,
            TotalDislikes,
            TotalComments,
          } = article;

          return (
            <motion.div
              key={articleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                transition: { duration: 0.2, ease: "easeOut" },
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
                      Le{" "}
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

                {author.id === userId && (
                  <div className="relative">
                    <button
                      className="text-gray-500 hover:text-purple-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(articleId === showMenu ? null : articleId);
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
                            // à compléter : modif
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
                    userId && userDislikes[articleId]
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

                {/* Ajoute des éléments différents selon la page */}
                {/* {page === "detail" && ( */}
                <button
                  className="flex items-center space-x-2 hover:text-purple-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* <Share2 className="h-5 w-5" /> */}
                </button>
                {/* )} */}
              </div>
            </motion.div>
          );
        })}
    </>
  );
};

export default ArticleCardList;
