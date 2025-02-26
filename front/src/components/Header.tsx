import {
  Search,
  Skull,
  MessageSquare,
  Menu,
  ThumbsDown,
  FileText,
  Bomb,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-black border-b border-purple-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
          >
            <Skull className="h-8 w-8 text-purple-500" />
            <span className="ml-2 text-2xl font-bold text-purple-400">
              Asocial
            </span>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <motion.div
              className={`flex items-center transition-colors cursor-pointer ${
                location.pathname === "/publications"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-purple-400"
              }`}
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/publications")}
            >
              <FileText className="h-5 w-5" />
              <span className="ml-1">Publications</span>
            </motion.div>
            <motion.div
              className={`flex items-center transition-colors cursor-pointer ${
                location.pathname === "/auth"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-purple-400"
              }`}
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/auth")}
            >
              <Bomb className="h-5 w-5" />
              <span className="ml-1">Chaos</span>
            </motion.div>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for chaos..."
                className="w-full bg-gray-900 text-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-gray-800"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.1 }}
            >
              <MessageSquare className="h-6 w-6" />
            </motion.button>
            <motion.button
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.1 }}
            >
              <ThumbsDown className="h-6 w-6" />
            </motion.button>
            <motion.button
              className={`flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 hover:bg-purple-900 ${
                location.pathname === "/profile" ? "ring-2 ring-purple-500" : ""
              }`}
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/profile")}
            >
              <span className="text-sm font-medium text-purple-400">X</span>
            </motion.button>
            <motion.button
              className="md:hidden p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.1 }}
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
