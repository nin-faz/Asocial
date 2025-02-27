import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ThumbsDown,
  MessageSquare,
  Share2,
  Skull,
  ArrowLeft,
  Send,
  MoreVertical,
} from "lucide-react";

interface Comment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  dislikes: number;
}

const mockComments: Comment[] = [
  {
    id: 1,
    username: "VoidWalker",
    content:
      "Complètement d'accord. La société n'est qu'une construction fragile.",
    timestamp: "Il y a 1 heure",
    dislikes: 42,
  },
  {
    id: 2,
    username: "DigitalNihilist",
    content:
      "Tu touches à quelque chose de profond ici. Les réseaux sociaux ont créé une génération d'esclaves dopaminergiques.",
    timestamp: "Il y a 2 heures",
    dislikes: 28,
  },
  {
    id: 3,
    username: "ChaosEmperor",
    content:
      "Je préfère ma solitude numérique à vos connections superficielles.",
    timestamp: "Il y a 3 heures",
    dislikes: 76,
  },
];

// Mock posts data (same as in PublicationPage)
const mockPosts = [
  {
    id: 1,
    username: "ChaosLord",
    content:
      "La société n'est qu'une illusion collective que nous maintenons par peur du vide. #Nihilisme",
    timestamp: "Il y a 2 heures",
    dislikes: 666,
    comments: 13,
  },
  {
    id: 2,
    username: "DarkPhilosopher",
    content:
      "Plus je côtoie les humains, plus j'apprécie ma solitude. Les réseaux sociaux sont la preuve de notre décadence collective.",
    timestamp: "Il y a 5 heures",
    dislikes: 421,
    comments: 42,
    image:
      "https://images.unsplash.com/photo-1516410529446-2c777cb7366d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 3,
    username: "DigitalAnarchist",
    content:
      "Vos likes sont le symbole de votre besoin pathétique d'approbation. Ici, nous célébrons la désapprobation. 🖤",
    timestamp: "Il y a 8 heures",
    dislikes: 1337,
    comments: 89,
  },
];

const PublicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);

  // Find the post based on the ID from URL
  const postId = parseInt(id || "1");
  const post = mockPosts.find((p) => p.id === postId) || mockPosts[0];

  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    const newCommentObj = {
      id: comments.length + 1,
      username: "NightmareEntity", // Current user
      content: newComment,
      timestamp: "À l'instant",
      dislikes: 0,
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  const handleDislike = () => {
    // In a real app, this would update the post's dislikes in the database
    console.log("Disliked post", postId);
  };

  const handleDislikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, dislikes: comment.dislikes + 1 }
          : comment
      )
    );
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
                {post.username}
              </h3>
              <p className="text-gray-500 text-sm">{post.timestamp}</p>
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
              <span>{post.dislikes}</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>{comments.length}</span>
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
          Commentaires ({comments.length})
        </h2>

        {comments.map((comment, index) => (
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
                      {comment.username}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {comment.timestamp}
                    </span>
                  </div>
                  <button className="text-gray-500 hover:text-gray-400">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-gray-300 mb-2">{comment.content}</p>
                <div className="flex items-center text-gray-500">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDislikeComment(comment.id)}
                    className="flex items-center space-x-1 hover:text-purple-400"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm">{comment.dislikes}</span>
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
