import React, { useState, useEffect } from "react";
import { ThumbsDown, MessageCircle, Plus, Send } from "lucide-react";
import { motion } from "framer-motion";

// Mock data
const mockBubbles = [
  {
    id: "1",
    title: "Quel est le meilleur langage de programmation ?",
    author: "Nino",
    createdAt: "2h ago",
    replyCount: 24,
    dislikeCount: 3,
    messages: [
      {
        id: "m1",
        author: "LordXenura",
        text: "TypeScript 🔥",
        dislikes: 5,
        replies: 2,
        time: "45 min",
      },
      {
        id: "m2",
        author: "Jacozizi",
        text: "Python is king 🐍",
        dislikes: 12,
        replies: 4,
        time: "30 min",
      },
      {
        id: "m3",
        author: "AymX",
        text: "Go > tous les autres",
        dislikes: 0,
        replies: 0,
        time: "5 min",
        isNew: true,
      },
    ],
  },
  {
    id: "2",
    title: "Est-ce que Neuralink va révolutionner le cerveau humain ?",
    author: "DigitalAnarchist",
    createdAt: "4h ago",
    replyCount: 156,
    dislikeCount: 45,
    messages: [],
  },
  {
    id: "3",
    title: "La meilleure pizza de Paris c'est laquelle ?",
    author: "Mouss",
    createdAt: "1h ago",
    replyCount: 89,
    dislikeCount: 67,
    messages: [],
  },
];

const BubbleMessage = ({ message, onDislike, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-4 border border-purple-900 hover:border-purple-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-purple-400 font-semibold text-sm">
            {message.author}
          </p>
          <p className="text-gray-500 text-xs">{message.time}</p>
        </div>
        {message.isNew && (
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            NEW
          </span>
        )}
      </div>
      <p className="text-gray-200 mb-3">{message.text}</p>
      <div className="flex gap-4 text-gray-500 text-sm">
        <button
          onClick={() => onDislike(message.id)}
          className="flex items-center gap-1 hover:text-purple-400 transition-colors"
        >
          <ThumbsDown size={16} />
          <span>{message.dislikes}</span>
        </button>
        <div className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer">
          <MessageCircle size={16} />
          <span>{message.replies}</span>
        </div>
      </div>
    </motion.div>
  );
};

const BubbleDetail = ({ bubble, onBack }) => {
  const [messages, setMessages] = useState(bubble.messages);
  const [replyText, setReplyText] = useState("");

  const handleDislike = (messageId) => {
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, dislikes: m.dislikes + 1 } : m,
      ),
    );
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      const newMessage = {
        id: `m${Date.now()}`,
        author: "You",
        text: replyText,
        dislikes: 0,
        replies: 0,
        time: "now",
        isNew: true,
      };
      setMessages([...messages, newMessage]);
      setReplyText("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-gray-900 rounded-lg p-6 mb-6 border border-purple-800">
        <button
          onClick={onBack}
          className="text-purple-400 text-sm mb-4 hover:text-purple-300"
        >
          ← Back to Bubbles
        </button>
        <h1 className="text-2xl font-bold text-purple-400 mb-3">
          {bubble.title}
        </h1>
        <div className="flex gap-6 text-gray-400 text-sm">
          <span>📍 {bubble.author}</span>
          <span>⏱️ {bubble.createdAt}</span>
          <span>💬 {bubble.replyCount} replies</span>
          <span>👎 {bubble.dislikeCount} dislikes</span>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No replies yet. Be the first to jump in!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <BubbleMessage
              key={msg.id}
              message={msg}
              onDislike={handleDislike}
              index={idx}
            />
          ))
        )}
      </div>

      {/* Reply Input */}
      <div className="bg-gray-900 rounded-lg p-4 border border-purple-900">
        <div className="flex gap-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
            placeholder="Drop your controversial opinion..."
            className="flex-1 bg-gray-800 text-white rounded px-4 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleSendReply}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const BubbleCard = ({ bubble, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: "#a855f7" }}
      onClick={onClick}
      className="bg-gray-900 rounded-lg p-5 border border-purple-900 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-900/20"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">🫧</div>
        <div className="flex-1">
          <h3 className="text-purple-400 font-semibold line-clamp-2">
            {bubble.title}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            by {bubble.author} • {bubble.createdAt}
          </p>
        </div>
      </div>
      <div className="flex gap-4 text-gray-400 text-sm">
        <span className="flex items-center gap-1">
          <MessageCircle size={14} /> {bubble.replyCount}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsDown size={14} /> {bubble.dislikeCount}
        </span>
      </div>
    </motion.div>
  );
};

export default function BubblesMockup() {
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [bubbles, setBubbles] = useState(mockBubbles);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-purple-400">Bubbles 🫧</h1>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus size={20} />
              New Bubble
            </button>
          </div>
          <p className="text-gray-400">
            Real-time discussions where unpopular opinions shine
          </p>
        </motion.div>

        {/* Content */}
        {selectedBubble ? (
          <BubbleDetail
            bubble={selectedBubble}
            onBack={() => setSelectedBubble(null)}
          />
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["Trending", "Hot", "Recent", "Most Controversial"].map(
                (filter) => (
                  <button
                    key={filter}
                    className="px-4 py-2 bg-gray-800 hover:bg-purple-900 text-purple-400 rounded-full text-sm whitespace-nowrap transition-colors border border-purple-900"
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>

            {/* Bubbles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bubbles.map((bubble, idx) => (
                <motion.div
                  key={bubble.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <BubbleCard
                    bubble={bubble}
                    onClick={() => setSelectedBubble(bubble)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
