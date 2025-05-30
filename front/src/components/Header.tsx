import { useContext, useEffect, useState } from "react";
import {
  Search,
  Menu,
  Home,
  Bomb,
  LogOut,
  User,
  BarChart2,
  ThumbsDown,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { GET_USER_BY_ID } from "../queries";
import { useQuery } from "@apollo/client";

const Header = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user, logout } = auth;

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const { pathname } = useLocation();
  const { searchTerm, setSearchTerm } = useSearch();

  const isPublicationsActive =
    pathname === "/publications" || pathname.startsWith("/publications/");

  // Vide le champ quand on quitte /publications
  useEffect(() => {
    if (!pathname.startsWith("/publications") && searchTerm !== "") {
      setSearchTerm("");
    }
  }, [pathname]);

  const { data: userInfos } = useQuery(GET_USER_BY_ID, {
    variables: { id: user?.id! },
    skip: !user,
  });

  const userInfosData = userInfos?.findUserById;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-black border-b border-purple-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo and Brand */}
          <motion.div
            className="flex items-center cursor-pointer z-10"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
          >
            <img src="/logo.svg" alt="Logo" className="h-9 w-10" />

            <span className="ml-2 text-2xl font-bold text-purple-400">
              Asocial
            </span>
          </motion.div>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            <div className="flex items-center justify-between w-full max-w-4xl px-4">
              {/* Left Navigation */}
              <nav className="flex items-center space-x-8">
                <motion.div
                  className={`flex items-center transition-colors cursor-pointer ${
                    isPublicationsActive
                      ? "text-purple-400"
                      : "text-gray-400 hover:text-purple-400"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => navigate("/publications")}
                >
                  <Home className="h-7 w-7" />
                  <span className="ml-1">Publications</span>
                </motion.div>
                {!user ? (
                  <motion.div
                    className={`flex items-center transition-colors cursor-pointer ${
                      pathname === "/auth"
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-purple-400"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate("/auth")}
                  >
                    <Bomb className="h-7 w-7" />
                    <span className="ml-1">Chaos</span>
                  </motion.div>
                ) : null}
              </nav>

              {/* Centered Search Bar */}
              {pathname.startsWith("/publications") && (
                <div
                  className={`w-full max-w-md ${
                    !user ? "mr-32 px-8" : "mr-24 px-2"
                  }`}
                >
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Naviguer dans le chaos..."
                      className="w-full bg-gray-900 text-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-gray-800"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 z-10">
            {user && (
              <>
                <motion.button
                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    if (pathname === "/profile") {
                      // Si déjà sur la page profile, mettre à jour l'URL avec le nouveau tab
                      navigate("/profile?tab=dislikes", { replace: true });
                    } else {
                      navigate("/profile?tab=dislikes");
                    }
                  }}
                  title="Voir mes dislikes"
                >
                  <ThumbsDown className="h-6 w-6" />
                </motion.button>
                <motion.button
                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    if (pathname === "/profile") {
                      // Si déjà sur la page profile, mettre à jour l'URL avec le nouveau tab
                      navigate("/profile?tab=statistiques", { replace: true });
                    } else {
                      navigate("/profile?tab=statistiques");
                    }
                  }}
                  title="Voir mes statistiques"
                >
                  <BarChart2 className="h-6 w-6" />
                </motion.button>
              </>
            )}

            {user ? (
              <div className="relative">
                <motion.button
                  className={`flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 hover:bg-purple-900 ${
                    pathname === "/profile" ? "ring-2 ring-purple-500" : ""
                  }`}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="text-sm font-medium text-purple-400">
                    {userInfosData?.username?.charAt(0).toUpperCase() || "X"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-purple-900 rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-800">
                        <p className="text-purple-400 font-medium">
                          {userInfosData?.username
                            ? userInfosData.username.charAt(0).toUpperCase()
                            : userInfosData?.username?.slice(1)}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowUserMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profil
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 hover:bg-purple-900"
                whileHover={{ scale: 1.1 }}
                onClick={() => navigate("/auth")}
              >
                <span className="text-sm font-medium text-purple-400">X</span>
              </motion.button>
            )}

            <motion.button
              className="md:hidden p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="px-4 py-3">
              {pathname.startsWith("/publications") && (
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Naviguer dans le chaos..."
                    className="w-full bg-gray-800 text-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                </div>
              )}

              <nav className="space-y-1">
                <button
                  className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-800 ${
                    isPublicationsActive ? "text-purple-400" : "text-gray-300"
                  }`}
                  onClick={() => {
                    navigate("/publications");
                    setShowMobileMenu(false);
                  }}
                >
                  <Home className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-300">Publications</span>
                </button>

                {user ? (
                  <>
                    <button
                      className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800"
                      onClick={() => {
                        navigate("/profile");
                        setShowMobileMenu(false);
                      }}
                    >
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-300">Profil</span>
                    </button>
                    <button
                      className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800"
                      onClick={() => {
                        navigate("/profile?tab=dislikes");
                        setShowMobileMenu(false);
                      }}
                    >
                      <ThumbsDown className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-300">Mes dislikes</span>
                    </button>
                    <button
                      className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800"
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-300">Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <button
                    className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800"
                    onClick={() => {
                      navigate("/auth");
                      setShowMobileMenu(false);
                    }}
                  >
                    <Bomb className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-300">Chaos</span>
                  </button>
                )}

                <button
                  className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800"
                  onClick={() => {
                    navigate("/about");
                    setShowMobileMenu(false);
                  }}
                >
                  <Info className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-300">À propos</span>
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
