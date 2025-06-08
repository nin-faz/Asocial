import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  FIND_ARTICLE_BY_ID,
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
  FIND_DISLIKES_BY_USER_ID_FOR_COMMENTS,
  GET_COMMENTS,
  GET_USER_BY_ID,
} from "../../queries";
import {
  ADD_ARTICLE_DISLIKE,
  ADD_COMMENT,
  DELETE_ARTICLE,
  DELETE_ARTICLE_DISLIKE,
  DELETE_COMMENT,
  ADD_COMMENT_DISLIKE,
  DELETE_COMMENT_DISLIKE,
  UPDATE_ARTICLE,
  UPDATE_COMMENT,
} from "../../mutations";
import {
  ThumbsDown,
  MessageSquare,
  Share2,
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { GetCommentsQuery } from "../../gql/graphql";
import {
  showArticleDeletedToast,
  showArticleUpdatedToast,
  showCommentAddedToast,
  showCommentDeletedToast,
  showCommentUpdatedToast,
  showLoginRequiredToast,
} from "../../utils/customToasts";
import UserIcon from "../../components/icons/UserIcon";
import ImageUploader from "../../components/ImageUploader";

interface PublicationDetailsPageProps {
  articleId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

const PublicationDetailsPage = ({
  articleId,
  isModal,
}: PublicationDetailsPageProps) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;

  const { id } = useParams();
  const finalId = articleId || id;

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get("edit") === "true";

  useEffect(() => {
    if (isEditMode) {
      setIsEditing(true);
    }
  }, [isEditMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: articleData, refetch: refetchArticleData } = useQuery(
    FIND_ARTICLE_BY_ID,
    {
      variables: { id: finalId! },
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
    useQuery(FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES, {
      variables: { userId: user?.id! },
      skip: !user?.id,
    });

  const { data: commentDislikeUser, refetch: refetchCommentDislikeUser } =
    useQuery(FIND_DISLIKES_BY_USER_ID_FOR_COMMENTS, {
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
    if (articleDislikeUser?.getDislikesByUserIdForArticles) {
      articleDislikeUser.getDislikesByUserIdForArticles.forEach((dislike) => {
        if (
          articleData?.findArticleById &&
          dislike?.article?.id === articleData.findArticleById.id
        ) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }

    // Vérification des dislikes pour les commentaires
    if (commentDislikeUser?.getDislikesByUserIdForComments) {
      commentDislikeUser.getDislikesByUserIdForComments.forEach((dislike) => {
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
      // Mettre à jour l'état local immédiatement pour une réponse instantanée
      const newDislikeState = !userArticleDislikes[articleId];
      setUserArticleDislikes((prev) => ({
        ...prev,
        [articleId]: newDislikeState,
      }));

      // Créer une copie locale des données pour mettre à jour l'UI immédiatement
      const currentDislikes = article?.TotalDislikes || 0;
      const updatedDislikes = newDislikeState
        ? currentDislikes + 1
        : currentDislikes - 1;

      // Mettre à jour l'UI immédiatement avec la nouvelle valeur
      const dislikeCountElement = document.querySelector(".dislike-count");
      if (dislikeCountElement) {
        dislikeCountElement.textContent = String(Math.max(0, updatedDislikes));
      }

      if (newDislikeState) {
        // Ajoute le dislike
        await addArticleDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a disliké l'article.");
      } else {
        // Supprime le dislike
        await deleteArticleDislike({
          variables: { articleId, userId: user.id! },
        });
        console.log(user.username, "a retiré son dislike.");
      }

      // Rafraîchir les données après l'opération
      await refetchArticleDislikeUser();
      await refetchArticleData();
    } catch (error) {
      // En cas d'erreur, remettre l'état précédent
      setUserArticleDislikes((prev) => ({
        ...prev,
        [articleId]: !userArticleDislikes[articleId],
      }));

      // Remettre le compteur de dislikes à sa valeur précédente en cas d'erreur
      const currentDislikes = article?.TotalDislikes || 0;
      const dislikeCountElement = document.querySelector(".dislike-count");
      if (dislikeCountElement) {
        dislikeCountElement.textContent = String(currentDislikes);
      }

      console.error("Erreur lors de l'ajout/suppression du dislike :", error);
    }
  };

  const [newComment, setNewComment] = useState("");

  const { data: commentsData, refetch: refetchComments } = useQuery(
    GET_COMMENTS,
    {
      variables: { articleId: finalId! },
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null
  );

  const [createComment] = useMutation(ADD_COMMENT);

  const handleCreateComment = async () => {
    // Vérifier si c'est un commentaire principal ou une réponse
    const content = replyToCommentId ? replyContent : newComment;

    if (content.trim() === "") return;
    if (!user) {
      showLoginRequiredToast("comment");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment({
        variables: {
          content: content,
          userId: user?.id!,
          articleId: finalId!,
          parentId: replyToCommentId,
        },
      });

      showCommentAddedToast();
      console.log(
        replyToCommentId
          ? "Réponse ajoutée avec succès !"
          : "Commentaire ajouté avec succès !"
      );

      // Réinitialiser les états
      setNewComment("");
      setReplyContent("");
      setReplyToCommentId(null);
      setReplyingToUsername(null);
      await Promise.all([refetchComments(), refetchArticleData()]);
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await deleteComment({
        variables: { commentId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.deleteComment?.success) {
        showCommentDeletedToast();
        console.log("Suppression du commentaire", commentId, "réussie");
        await refetchComments();
        await refetchArticleData();
      } else {
        console.error(
          "Échec de la suppression du commentaire:",
          response?.data?.deleteComment?.message || "Raison inconnue"
        );
        toast.error(
          `Échec de la suppression : ${
            response?.data?.deleteComment?.message || "Erreur inconnue"
          }`
        );
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire :", err);
      if (err instanceof Error) {
        toast.error("Erreur lors de la suppression : " + err.message);
      } else {
        toast.error("Une erreur inattendue est survenue");
      }
    }
  };

  const handleEditComment = (comment: CommentType) => {
    setEditingCommentId(comment?.id ?? null);
    setEditedCommentContent(comment?.content ?? "");
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };

  const handleUpdateComment = async (commentId: string) => {
    if (editedCommentContent.trim() === "") return;

    try {
      const response = await updateComment({
        variables: {
          commentId,
          content: editedCommentContent,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.updateComment?.success) {
        showCommentUpdatedToast();
        console.log("Commentaire mis à jour avec succès !");
        setEditingCommentId(null);
        await refetchComments();
      } else {
        console.error(
          response?.data?.updateComment?.message ||
            "Échec de la mise à jour du commentaire."
        );
        toast.error("Échec de la mise à jour du commentaire.");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du commentaire :", err);
      toast.error(
        "Une erreur est survenue lors de la mise à jour du commentaire."
      );
    }
  };

  const [addCommentDislike] = useMutation(ADD_COMMENT_DISLIKE);
  const [deleteCommentDislike] = useMutation(DELETE_COMMENT_DISLIKE);

  type CommentType = NonNullable<GetCommentsQuery["getComments"]>[number];

  const handleCommentDislike = async (comment: CommentType) => {
    if (!user) {
      showLoginRequiredToast("dislike");
      return;
    }

    const commentId = comment?.id!;
    const hasDisliked = userCommentDislikes[commentId] ?? false;
    const newDislikeState = !hasDisliked;

    try {
      // Mettre à jour l'état local immédiatement pour une réponse instantanée
      setUserCommentDislikes((prev) => ({
        ...prev,
        [commentId]: newDislikeState,
      }));

      // Créer une copie locale des données pour mettre à jour l'UI immédiatement
      const currentDislikes = comment?.TotalDislikes || 0;
      const updatedDislikes = newDislikeState
        ? currentDislikes + 1
        : currentDislikes - 1;

      // Mettre à jour l'UI immédiatement avec la nouvelle valeur
      const dislikeElement = document.querySelector(
        `[data-comment-id="${commentId}"] .comment-dislike-count`
      );
      if (dislikeElement) {
        dislikeElement.textContent = String(Math.max(0, updatedDislikes));
      }

      if (newDislikeState) {
        // Ajoute le dislike
        await addCommentDislike({
          variables: { commentId, userId: user?.id! },
        });
        console.log(user?.username, "a disliké le commentaire.");
      } else {
        // Supprime le dislike
        await deleteCommentDislike({
          variables: { commentId, userId: user?.id! },
        });
        console.log(user?.username, "a retiré son dislike.");
      }

      // Rafraîchir les données après l'opération
      await refetchComments();
      await refetchCommentDislikeUser();
    } catch (err) {
      // En cas d'erreur, remettre l'état précédent
      setUserCommentDislikes((prev) => ({
        ...prev,
        [commentId]: hasDisliked,
      }));

      // Remettre le compteur de dislikes à sa valeur précédente en cas d'erreur
      const currentDislikes = comment?.TotalDislikes || 0;
      const dislikeElement = document.querySelector(
        `[data-comment-id="${commentId}"] .comment-dislike-count`
      );
      if (dislikeElement) {
        dislikeElement.textContent = String(currentDislikes);
      }

      console.error("Erreur dislike :", err);
    }
  };

  const [updateArticle, { loading: updating }] = useMutation(UPDATE_ARTICLE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(article?.title || "");
  const [editedContent, setEditedContent] = useState(article?.content || "");
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(
    article?.imageUrl || null
  );

  useEffect(() => {
    if (article) {
      setEditedTitle(article.title || "");
      setEditedContent(article.content || "");
      setEditedImageUrl(article.imageUrl || null);
    }
  }, [article]);

  const handleUpdateArticle = async () => {
    // Ajoutons des logs pour voir ce qui est envoyé
    console.log("État de l'image avant envoi:", {
      editedImageUrl,
      type: typeof editedImageUrl,
      isNull: editedImageUrl === null,
    });

    try {
      const variables = {
        id: article?.id!,
        title: editedTitle,
        content: editedContent,
        imageUrl: editedImageUrl,
      };

      console.log("Variables envoyées à la mutation:", variables);

      const response = await updateArticle({
        variables,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.updateArticle?.success) {
        console.log("Article mis à jour avec succès !");
        setIsEditing(false);
        showArticleUpdatedToast();
        refetchArticleData();
      } else {
        console.error(
          response?.data?.updateArticle?.message ||
            "Échec de la mise à jour de l'article."
        );
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'article:", err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    }
  };

  // Fonction pour partager un article
  const handleShareArticle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/publications/${finalId}`;
    const shareTitle = article?.title
      ? `${article.title} - Asocial`
      : "Découvrez cet article sur Asocial";
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

  const { data: userData } = useQuery(GET_USER_BY_ID, {
    variables: { id: user?.id! },
    skip: !user?.id,
  });

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}

      {!isModal && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center text-purple-400 hover:text-purple-300 mb-6"
          onClick={() => navigate("/publications")}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour aux publications
        </motion.button>
      )}

      {/* Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-6 border border-purple-900 mb-8"
      >
        {/* Post Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/users/${article?.author.id}`);
              }}
              title={`Voir le profil de ${article?.author.username}`}
            >
              <UserIcon iconName={article?.author.iconName} size="small" />
            </div>
            <div>
              <h3
                className="text-purple-400 font-semibold text-lg cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/users/${article?.author.id}`);
                }}
                title={`Voir le profil de ${article?.author.username}`}
              >
                {article?.author.username}
              </h3>
              <p className="text-gray-500 text-sm">
                Le{" "}
                {article?.updatedAt
                  ? new Date(parseInt(article?.updatedAt, 10))
                      .toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(" ", " à ")
                  : new Date(parseInt(article?.createdAt ?? "0", 10))
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
          </div>

          {article?.author.id === user?.id && !isEditing && (
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
                      setIsEditing(true);
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
        {isEditing ? (
          <div className="flex flex-col space-y-4">
            {/* Champ d'édition du titre */}
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              placeholder="Titre de l'article  (Optionnel)"
            />

            {/* Champ d'édition du contenu */}
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            />

            {/* Ajout du téléchargeur d'image */}
            <ImageUploader
              imageUrl={editedImageUrl}
              onImageChange={setEditedImageUrl}
            />

            <div className="flex justify-end space-x-4 pb-4">
              <button
                onClick={() => {
                  if (article?.content === "") {
                    setEditedContent("");
                  }
                  if (article?.title === "") {
                    setEditedTitle("");
                  }
                  setEditedImageUrl(article?.imageUrl || null);
                  setIsEditing(false);
                }}
                className="flex items-center px-3 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </button>
              <button
                onClick={handleUpdateArticle}
                disabled={updating}
                className={`flex items-center px-3 py-1 ${
                  updating
                    ? "bg-purple-800"
                    : "bg-purple-600 hover:bg-purple-700 text-purple-400 hover:text-purple-300"
                } text-white rounded-lg`}
              >
                <Save className="h-4 w-4 mr-1" />
                {updating ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-purple-400 mb-2">
              {article?.title}
            </h2>
            <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">
              {article?.content}
            </p>
          </>
        )}

        {/* Post Image */}
        {!isEditing && article?.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt="Article"
              className="w-full sm:h-[40rem] rounded-lg"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-gray-500 border-t border-gray-800 pt-4">
          <div className="flex items-center space-x-6 text-gray-500">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 hover:text-purple-400 ${
                user && userArticleDislikes[article?.id!]
                  ? "text-purple-400"
                  : "text-gray-500"
              }`}
              onClick={(e) =>
                article?.id && handleArticleDislike(e, article.id)
              }
            >
              <ThumbsDown className="h-5 w-5" />
              <span className="dislike-count">{article?.TotalDislikes}</span>
            </motion.button>

            <button
              className="flex items-center space-x-2 hover:text-purple-400"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{article?.TotalComments}</span>
            </button>
          </div>

          <button
            className="flex items-center space-x-2 hover:text-purple-400"
            onClick={handleShareArticle}
          >
            <Share2 className="h-5 w-5" />
            <span>Partager</span>
          </button>
        </div>
      </motion.div>

      {/* Comment Form */}
      {!replyToCommentId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-lg p-4 mb-8 border border-purple-900"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                <UserIcon
                  iconName={userData?.findUserById?.iconName}
                  size="small"
                />
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
                onClick={handleCreateComment}
                className="absolute right-3 bottom-3 text-purple-400 hover:text-purple-300"
                disabled={isSubmitting}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">
          Commentaires ({article?.TotalComments})
        </h2>

        {commentsData?.getComments?.map((comment) => (
          <motion.div
            key={comment?.id}
            data-comment-id={comment?.id}
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
            className="bg-gray-900 rounded-lg p-6 border border-purple-900 cursor-pointer hover:border-purple-700 transition-colors w-full"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/users/${comment?.author.id}`);
                  }}
                  title={`Voir le profil de ${comment?.author.username}`}
                >
                  <UserIcon iconName={comment?.author?.iconName} size="small" />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-purple-400 font-medium">
                      {comment?.author.username}
                    </span>{" "}
                    <p className="text-gray-500 text-sm">
                      Le{" "}
                      {comment?.updatedAt
                        ? `${new Date(parseInt(comment?.createdAt ?? "0", 10))
                            .toLocaleString("fr-FR", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .replace(",", " à")} (modifié le ${new Date(
                            parseInt(comment?.updatedAt, 10)
                          )
                            .toLocaleString("fr-FR", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .replace("", " à ")})`
                        : new Date(parseInt(comment?.createdAt ?? "0", 10))
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
                  {comment?.author.id === user?.id && (
                    <div className="relative ml-4">
                      <button
                        className="text-gray-500 hover:text-purple-400 p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            comment?.id === showMenu
                              ? null
                              : comment?.id ?? null
                          );
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {showMenu === comment?.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, x: 20 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-0 right-0 w-36 bg-gray-800 text-white rounded-md shadow-lg p-2 space-y-2 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComment(comment?.id!);
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
                              handleEditComment(comment);
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
                {editingCommentId === comment?.id ? (
                  <div className="mt-2 mb-4">
                    <textarea
                      value={editedCommentContent}
                      onChange={(e) => setEditedCommentContent(e.target.value)}
                      className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={handleCancelEditComment}
                        className="flex items-center px-3 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Annuler
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment?.id!)}
                        className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 mb-2">{comment?.content}</p>
                    {/* Replies */}
                    {comment &&
                      comment.replies &&
                      comment.replies.length > 0 && (
                        <div className="ml-8 mt-4 space-y-3">
                          <h4 className="text-purple-300 text-sm font-medium mb-2">
                            {comment.replies.length}{" "}
                            {comment.replies.length === 1
                              ? "réponse"
                              : "réponses"}
                          </h4>
                          {comment.replies.map((reply) => (
                            <motion.div
                              key={reply?.id}
                              data-comment-id={reply?.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              whileHover={{
                                scale: 1.03,
                                boxShadow:
                                  "0px 0px 10px rgba(128, 0, 128, 0.6)",
                                transition: {
                                  duration: 0.2,
                                  ease: "easeOut",
                                },
                              }}
                              whileTap={{ scale: 0.98 }}
                              className="bg-gray-800 rounded-lg p-4 border border-purple-700 relative hover:border-purple-500 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-l-lg"></div>
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div
                                    className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/users/${reply?.author.id}`);
                                    }}
                                    title={`Voir le profil de ${reply?.author.username}`}
                                  >
                                    <UserIcon
                                      iconName={reply?.author?.iconName}
                                      size="small"
                                    />
                                  </div>
                                </div>{" "}
                                <div className="flex-grow">
                                  {" "}
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      <span className="text-purple-300 font-medium">
                                        {reply?.author.username}
                                      </span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">
                                      {reply?.updatedAt
                                        ? `Modifié le ${new Date(
                                            parseInt(reply?.updatedAt, 10)
                                          )
                                            .toLocaleString("fr-FR", {
                                              year: "numeric",
                                              month: "numeric",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                            .replace(" ", " à ")}`
                                        : `Le ${new Date(
                                            parseInt(
                                              reply?.createdAt ?? "0",
                                              10
                                            )
                                          )
                                            .toLocaleString("fr-FR", {
                                              year: "numeric",
                                              month: "numeric",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                            .replace(" ", " à ")}`}
                                    </p>
                                  </div>
                                  {editingCommentId === reply?.id ? (
                                    <div className="mt-2 mb-2">
                                      <textarea
                                        value={editedCommentContent}
                                        onChange={(e) =>
                                          setEditedCommentContent(
                                            e.target.value
                                          )
                                        }
                                        className="w-full bg-gray-700 text-gray-100 rounded-lg p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-sm"
                                      />
                                      <div className="flex justify-end space-x-2 mt-1">
                                        <button
                                          onClick={handleCancelEditComment}
                                          className="flex items-center px-2 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-xs"
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Annuler
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleUpdateComment(reply?.id!)
                                          }
                                          className="flex items-center px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs"
                                        >
                                          <Save className="h-3 w-3 mr-1" />
                                          Sauvegarder
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-400 text-sm mt-1">
                                      {reply?.content}
                                    </p>
                                  )}
                                  {/* Actions de réponse */}{" "}
                                  {/* Bouton de dislike pour les réponses (temporairement désactivé)
                                  <div className="flex justify-end mt-2 text-gray-500">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className={`flex items-center space-x-1 text-xs hover:text-purple-400 ${
                                        userCommentDislikes[reply?.id!]
                                          ? "text-purple-400"
                                          : "text-gray-500"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCommentDislike({
                                          ...reply,
                                        });
                                      }}
                                    >
                                      {" "}
                                      <ThumbsDown className="h-3 w-3" />
                                      <span className="reply-dislike-count">
                                        {reply?.TotalDislikes || 0}
                                      </span>
                                    </motion.button>
                                  </div>
                                  */}
                                </div>
                                {/* Menu pour les réponses (si l'utilisateur est l'auteur) */}
                                {reply?.author.id === user?.id && (
                                  <div className="relative">
                                    <button
                                      className="text-gray-500 hover:text-purple-400 p-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(
                                          reply?.id === showMenu
                                            ? null
                                            : reply?.id ?? null
                                        );
                                      }}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </button>

                                    {showMenu === reply?.id && (
                                      <motion.div
                                        ref={menuRef}
                                        initial={{
                                          opacity: 0,
                                          scale: 0.95,
                                          x: 20,
                                        }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{
                                          opacity: 0,
                                          scale: 0.95,
                                          x: 20,
                                        }}
                                        transition={{
                                          duration: 0.2,
                                          ease: "easeOut",
                                        }}
                                        className="absolute top-0 right-0 w-32 bg-gray-800 text-white rounded-md shadow-lg p-2 space-y-1 z-10 text-xs"
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(reply?.id!);
                                            setShowMenu(null);
                                          }}
                                          className="flex items-center space-x-2 text-red-500 hover:text-red-400 w-full"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          <span>Supprimer</span>
                                        </button>
                                        <hr className="border-gray-700" />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditComment({
                                              ...reply,
                                            });
                                            setShowMenu(null);
                                          }}
                                          className="flex items-center space-x-2 text-purple-500 hover:text-purple-400 w-full"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                          <span>Modifier</span>
                                        </button>
                                      </motion.div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                  </>
                )}
                <div className="flex justify-between items-center mt-5 text-gray-500 border-t border-gray-800 pt-3">
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 hover:text-purple-400 text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyToCommentId(comment?.id ?? null);
                        setReplyingToUsername(comment?.author.username ?? null);
                      }}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Répondre</span>
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 hover:text-purple-400 ${
                      userCommentDislikes[comment?.id!]
                        ? "text-purple-400"
                        : "text-gray-500"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommentDislike(comment);
                    }}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span className="comment-dislike-count">
                      {comment?.TotalDislikes}
                    </span>
                  </motion.button>
                </div>

                {/* Reply Form inside comment */}
                {replyToCommentId === comment?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-4 mt-4 border border-purple-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-purple-400 font-medium text-sm">
                        Répondre à {replyingToUsername}
                      </h3>
                      <button
                        onClick={() => {
                          setReplyToCommentId(null);
                          setReplyingToUsername(null);
                          setReplyContent("");
                        }}
                        className="text-gray-500 hover:text-purple-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center">
                          <UserIcon
                            iconName={userData?.findUserById?.iconName}
                            size="small"
                          />
                        </div>
                      </div>
                      <div className="flex-grow relative">
                        <textarea
                          placeholder="Écrivez votre réponse..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 pr-10 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-sm"
                        />
                        <button
                          onClick={handleCreateComment}
                          className="absolute right-2 bottom-2 text-purple-400 hover:text-purple-300"
                          disabled={isSubmitting}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
};

export default PublicationDetailsPage;
