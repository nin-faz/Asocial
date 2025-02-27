import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ThumbsDown,
  MessageSquare,
  Share2,
  Skull,
  MoreVertical,
} from "lucide-react";

interface Post {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  dislikes: number;
  comments: number;
  image?: string;
}

const mockPosts: Post[] = [
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

function PublicationPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const navigate = useNavigate();

  const handleDislike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
      )
    );
  };

  const handlePostClick = (postId: number) => {
    navigate(`/publications/${postId}`);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Create Post Section */}
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
            />
            <div className="flex justify-end mt-3">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Publier
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 rounded-lg p-6 border border-purple-900 cursor-pointer hover:border-purple-700 transition-colors"
            onClick={() => handlePostClick(post.id)}
          >
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                  <Skull className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-purple-400 font-semibold">
                    {post.username}
                  </h3>
                  <p className="text-gray-500 text-sm">{post.timestamp}</p>
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

            {/* Post Content */}
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Post Image */}
            {post.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={post.image} alt="Post" className="w-full h-auto" />
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-6 text-gray-500">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDislike(post.id);
                }}
                className="flex items-center space-x-2 hover:text-purple-400"
              >
                <ThumbsDown className="h-5 w-5" />
                <span>{post.dislikes}</span>
              </motion.button>

              <button
                className="flex items-center space-x-2 hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(post.id);
                }}
              >
                <MessageSquare className="h-5 w-5" />
                <span>{post.comments}</span>
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
