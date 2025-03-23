import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  FIND_ARTICLE_BY_ID,
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE,
  FIND_DISLIKES_BY_USER_ID_FOR_COMMENT,
  GET_COMMENTS,
} from "../queries";
import {
  ADD_ARTICLE_DISLIKE,
  ADD_COMMENT,
  DELETE_ARTICLE,
  DELETE_ARTICLE_DISLIKE,
  DELETE_COMMENT,
  ADD_COMMENT_DISLIKE,
  DELETE_COMMENT_DISLIKE,
} from "../mutations";
import {
  ThumbsDown,
  MessageSquare,
  Share2,
  Skull,
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { GetCommentsQuery } from "../gql/graphql";
import {
  showArticleDeletedToast,
  showCommentAddedToast,
  showCommentDeletedToast,
  showLoginRequiredToast,
} from "../utils/customToasts";

const PublicationDetailsPage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;

  const { id } = useParams();
  const navigate = useNavigate();

  const { data: articleData, refetch: refetchArticleData } = useQuery(
    FIND_ARTICLE_BY_ID,
    {
      variables: { id: id! },
    }
  );

  const article = articleData?.findArticleById;

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
        console.log("Article supprimé avec succès !");
        navigate("/publications");
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

  const { data: articleDislikeUser, refetch: refetchArticleDislikeUser } =
    useQuery(FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE, {
      variables: { userId: user?.id! },
      skip: !user?.id,
    });

  const { data: commentDislikeUser, refetch: refetchCommentDislikeUser } =
    useQuery(FIND_DISLIKES_BY_USER_ID_FOR_COMMENT, {
      variables: { userId: user?.id! },
      skip: !user?.id,
    });

  const [userArticleDislikes, setUserArticleDislikes] = useState<{
    [key: string]: boolean;
  }>({});

  const [userCommentDislikes, setUserCommentDislikes] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (!user) {
      // Si l'utilisateur n'est pas connecté, réinitialiser les états
      setUserArticleDislikes({});
      setUserCommentDislikes({});
      return;
    }

    // Initialisation des maps pour les dislikes des articles et des commentaires
    const dislikesMap: { [key: string]: boolean } = {};
    const commentDislikesMap: { [key: string]: boolean } = {};

    // Vérification des dislikes pour l'article
    if (
      articleData?.findArticleById?.dislikes?.some(
        (dislike) => dislike?.user?.id === user?.id
      )
    ) {
      dislikesMap[articleData.findArticleById.id] = true;
    }

    // Vérification des dislikes pour l'article depuis la requête GraphQL
    if (articleDislikeUser?.getDislikesByUserId) {
      articleDislikeUser.getDislikesByUserId.forEach((dislike) => {
        if (
          articleData?.findArticleById &&
          dislike?.article?.id === articleData.findArticleById.id
        ) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }

    // Vérification des dislikes pour les commentaires
    if (commentDislikeUser?.getDislikesByUserId) {
      commentDislikeUser.getDislikesByUserId.forEach((dislike) => {
        if (dislike?.comment?.id) {
          commentDislikesMap[dislike.comment.id] = true;
        }
      });
    }

    // Mise à jour des états avec les données des dislikes
    setUserArticleDislikes(dislikesMap);
    setUserCommentDislikes(commentDislikesMap);
  }, [
    articleDislikeUser,
    commentDislikeUser,
    user,
    articleData?.findArticleById?.id,
  ]);

  const [addArticleDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteArticleDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  const handleArticleDislike = async (
    e: React.MouseEvent,
    articleId: string
  ) => {
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
      setUserArticleDislikes((prev) => ({
        ...prev,
        [articleId]: !prev[articleId],
      }));
      if (userArticleDislikes[articleId]) {
        await deleteArticleDislike({
          variables: { articleId, userId: user.id! },
        });
        console.log(user.username, "a retiré son dislike.");
      } else {
        await addArticleDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a disliké l'article.");
      }

      await refetchArticleDislikeUser();
      await refetchArticleData();

      console.log("Dislikes mis à jour.", userArticleDislikes);
    } catch (error) {
      console.error("Erreur lors de l'ajout/suppression du dislike :", error);
    }
  };

  const [newComment, setNewComment] = useState("");

  const { data: commentsData, refetch: refetchComments } = useQuery(
    GET_COMMENTS,
    {
      variables: { articleId: id! },
    }
  );

  const [createComment] = useMutation(ADD_COMMENT);

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    if (!user) {
      showLoginRequiredToast("comment");
      return;
    }

    try {
      await createComment({
        variables: {
          content: newComment,
          userId: user?.id!,
          articleId: id!,
        },
      });

      showCommentAddedToast();
      console.log("Commentaire ajouté avec succès !");

      setNewComment("");
      refetchComments();
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
    }
  };

  const [deleteComment] = useMutation(DELETE_COMMENT);

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({
        variables: { commentId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      showCommentDeletedToast();
      console.log("suppression du commentaire", commentId);

      refetchComments();
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire :", err);
    }
  };

  const [addCommentDislike] = useMutation(ADD_COMMENT_DISLIKE);
  const [deleteCommentDislike] = useMutation(DELETE_COMMENT_DISLIKE);

  type CommentType = NonNullable<GetCommentsQuery["getComments"]>[number];

  const handleCommentDislike = async (comment: CommentType) => {
    if (!user) {
      showLoginRequiredToast("dislike");
    }

    const hasDisliked = userCommentDislikes[comment?.id!] ?? false;

    try {
      if (hasDisliked) {
        await deleteCommentDislike({
          variables: { commentId: comment?.id!, userId: user?.id! },
        });
        setUserCommentDislikes((prev) => ({ ...prev, [comment?.id!]: false }));
        console.log(user?.username, "a retiré son dislike.");
      } else {
        await addCommentDislike({
          variables: { commentId: comment?.id!, userId: user?.id! },
        });
        setUserCommentDislikes((prev) => ({ ...prev, [comment?.id!]: true }));
        console.log(user?.username, "a disliké le commentaire.");
      }
      await refetchComments();
      await refetchCommentDislikeUser();
    } catch (err) {
      console.error("Erreur dislike :", err);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center text-purple-400 hover:text-purple-300 mb-6"
        onClick={() => navigate("/publications")}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux publications
      </motion.button>

      {/* Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-6 border border-purple-900 mb-8"
      >
        {/* Post Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center">
              <Skull className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold text-lg">
                {article?.author.username}
              </h3>
              <p className="text-gray-500 text-sm">
                Le {""}
                {article?.updatedAt
                  ? new Date(parseInt(article?.updatedAt, 10))
                      .toLocaleString()
                      .replace(" ", " à ")
                  : new Date(parseInt(article?.createdAt ?? "0", 10))
                      .toLocaleString()
                      .replace(" ", " à ")}
              </p>
            </div>
          </div>
          {/* <button className="text-gray-500 hover:text-purple-400">
            <MoreVertical className="h-5 w-5" />
          </button> */}

          {article?.author.id === user?.id && (
            <div className="relative">
              <button
                className="text-gray-500 hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(
                    article?.id === showMenu ? null : article?.id ?? null
                  );
                }}
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {showMenu === article?.id && (
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
                      handleDeleteArticle(article?.id);
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
                      // Gérer la modification
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

        {/* Post Content */}
        <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">
          {article?.content}
        </p>

        {/* Post Image */}
        {/* {post.image && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img src={post.image} alt="Post" className="w-full h-auto" />
          </div>
        )} */}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-gray-500 border-t border-gray-800 pt-4">
          <div className="flex items-center space-x-6 text-gray-500">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 ${
                user && userArticleDislikes[article?.id]
                  ? "text-purple-400"
                  : "text-gray-500"
              }`}
              onClick={(e) =>
                article?.id && handleArticleDislike(e, article.id)
              }
            >
              <ThumbsDown className="h-5 w-5" />
              <span>{article?.TotalDislikes}</span>
            </motion.button>

            <button
              className="flex items-center space-x-2 hover:text-purple-400"
              onClick={(e) => {
                e.stopPropagation();
                // handlePostClick(articleId);
              }}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{article?.TotalComments}</span>
            </button>
          </div>

          <button className="flex items-center space-x-2 hover:text-purple-400">
            <Share2 className="h-5 w-5" />
            <span>Partager</span>
          </button>
        </div>
      </motion.div>

      {/* Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 rounded-lg p-4 mb-8 border border-purple-900"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
              <Skull className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="flex-grow relative">
            <textarea
              placeholder="Ajoutez votre commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 pr-12 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            />
            <button
              onClick={handleAddComment}
              className="absolute right-3 bottom-3 text-purple-400 hover:text-purple-300"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">
          Commentaires ({article?.TotalComments})
        </h2>

        {commentsData?.getComments?.map((comment) => (
          <motion.div
            key={comment?.id}
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
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center">
                  <Skull className="h-4 w-4 text-purple-400" />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-purple-400 font-medium">
                      {comment?.author.username}
                    </span>
                    <p className="text-gray-500 text-sm">
                      Le {""}
                      {new Date(parseInt(comment?.createdAt ?? "0", 10))
                        .toLocaleString()
                        .replace(" ", " à ")}
                    </p>
                  </div>
                  {comment?.author.id === user?.id && (
                    <button
                      onClick={() => handleDeleteComment(comment?.id!)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 mb-2">{comment?.content}</p>
                <div className="flex justify-end mt-2 text-gray-500">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 ${
                      userCommentDislikes[comment?.id!]
                        ? "text-purple-400"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleCommentDislike(comment)}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span>{comment?.TotalDislikes}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
};

export default PublicationDetailsPage;
