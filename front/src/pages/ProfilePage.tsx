import React from "react";
import { motion } from "framer-motion";
import {
  ThumbsDown,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Skull,
  Link as LinkIcon,
} from "lucide-react";

const mockUserStats = {
  username: "NightmareEntity",
  joinDate: "Membre depuis Oct 2023",
  bio: "Misanthrope digital. Créateur de chaos. Ennemi des likes.",
  publications: 666,
  dislikes: 13337,
  followers: 42,
  following: 13,
};

const ProfilePage = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-6 border border-purple-900"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 rounded-full bg-purple-900 flex items-center justify-center"
          >
            <Skull className="h-16 w-16 text-purple-400" />
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-purple-400 mb-2">
              {mockUserStats.username}
            </h1>
            <p className="text-gray-500 mb-4">{mockUserStats.joinDate}</p>
            <p className="text-gray-300 mb-6 max-w-2xl">{mockUserStats.bio}</p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>{mockUserStats.publications} publications</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5" />
                <span>{mockUserStats.dislikes} dislikes reçus</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>
                  {mockUserStats.followers} détracteurs ·{" "}
                  {mockUserStats.following} cibles
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex md:flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg"
            >
              <Settings className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg"
            >
              <LinkIcon className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
            >
              <LogOut className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8 border-b border-purple-900">
        <nav className="flex gap-8">
          <button className="text-purple-400 border-b-2 border-purple-500 pb-4">
            Publications
          </button>
          <button className="text-gray-500 hover:text-gray-300 pb-4">
            Réponses
          </button>
          <button className="text-gray-500 hover:text-gray-300 pb-4">
            Médias
          </button>
          <button className="text-gray-500 hover:text-gray-300 pb-4">
            Dislikes
          </button>
        </nav>
      </div>

      {/* Feed */}
      <div className="mt-8 space-y-6">
        {/* Example Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg p-6 border border-purple-900"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center flex-shrink-0">
              <Skull className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 font-semibold">
                  {mockUserStats.username}
                </span>
                <span className="text-gray-500">· 2h</span>
              </div>
              <p className="text-gray-300 mb-4">
                Les réseaux sociaux sont une expérience de conformité massive.
                Ici, nous célébrons la divergence. #Asocial #DigitalNihilism
              </p>
              <div className="flex items-center gap-6 text-gray-500">
                <button className="flex items-center gap-2 hover:text-purple-400">
                  <ThumbsDown className="h-5 w-5" />
                  <span>1.3K</span>
                </button>
                <button className="flex items-center gap-2 hover:text-purple-400">
                  <MessageSquare className="h-5 w-5" />
                  <span>42</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default ProfilePage;
