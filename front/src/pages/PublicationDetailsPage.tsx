import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { FIND_ARTICLE_BY_ID } from "../queries";
import { GET_COMMENTS } from "../queries";
import { ADD_COMMENT, DELETE_COMMENT } from "../mutations";
import {
  ThumbsDown,
  MessageSquare,
  Share2,
  Skull,
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

interface Comment {
  id: string;
  content: string;
  author: {
    username: string;
    id: string;
  };
  createdAt?: string;
}

const PublicationDetailsPage = () => {
  const storedUser = sessionStorage.getItem("user");
  const userToken = storedUser ? JSON.parse(storedUser) : null;

  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const {
    loading: loadingComments,
    error: errorComments,
    data: commentsData,
  } = useQuery(GET_COMMENTS, {
    variables: { articleId: id },
  });
  const { loading, error, data } = useQuery(FIND_ARTICLE_BY_ID, {
    variables: { id },
  });

  const [createComment] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setNewComment("");
      toast.success("Commentaire ajouté avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout du commentaire :", error);
      toast.error("Une erreur est survenue lors de l'ajout du commentaire");
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      toast.success("Commentaire supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du commentaire");
      console.error(error);
    },
    refetchQueries: [{ query: GET_COMMENTS, variables: { articleId: id } }],
  });

  if (loading || loadingComments)
    return <div className="text-white">Chargement...</div>;
  if (error || errorComments)
    return (
      <div className="text-white">
        Erreur : {error?.message || errorComments?.message}
      </div>
    );

  const post = data.findArticleById;
  const comments = commentsData.getComments;

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    if (!userToken) {
      toast.error("Vous devez être connecté pour commenter.");
      return;
    }

    try {
      await createComment({
        variables: {
          content: newComment,
          userId: userToken.id,
          articleId: id,
        },
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userToken) {
      toast.error("Vous devez être connecté pour supprimer un commentaire.");
      return;
    }

    try {
      await deleteComment({
        variables: { commentId },
      });
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire :", err);
    }
  };

  const handleDislike = () => {
    // In a real app, this would update the post's dislikes in the database
    console.log("Disliked post", id);
  };

  // const handleDislikeComment = (commentId: number) => {
  //   setCommentList(
  //     commentList.map((comment) =>
  //       comment.id === commentId
  //         ? { ...comment, dislikes: comment.dislikes + 1 }
  //         : comment
  //     )
  //   );
  // };

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
                {post.author.username}
              </h3>
              <p className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-purple-400">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content */}
        <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Post Image */}
        {post.image && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img src={post.image} alt="Post" className="w-full h-auto" />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-gray-500 border-t border-gray-800 pt-4">
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDislike}
              className="flex items-center space-x-2 hover:text-purple-400"
            >
              <ThumbsDown className="h-5 w-5" />
              <span>0</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>{commentList.length}</span>
            </div>
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
          Commentaires ({comments?.length || 0})
        </h2>

        {comments.map((comment: Comment, index: number) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-gray-900 rounded-lg p-4 border border-purple-900"
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
                      {comment.author.username}
                    </span>
                  </div>
                  {comment.author.id === userToken?.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 mb-2">{comment.content}</p>
                <div className="flex items-center text-gray-500">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 hover:text-purple-400"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm">0</span>
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
