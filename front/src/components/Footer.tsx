import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  MessageSquareOff,
  UserX,
  AlertTriangle,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const [activeToast, setActiveToast] = useState<string | null>(null);

  const handleIconClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveToast(id);
    // Auto dismiss after 3 seconds
    setTimeout(() => setActiveToast(null), 3000);
  };

  return (
    <footer className="bg-gray-950 border-t border-purple-900 sm:flex sm:justify-between sm:items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center cursor-pointer z-10 mb-4"
              onClick={() => navigate("/")}
            >
              <img src="/logo.svg" alt="Logo" className="h-9 w-10" />
              <span className="ml-2 text-2xl font-bold text-purple-400">
                Asocial
              </span>
            </motion.div>
            <p className="text-gray-400 mb-4">
              Le réseau anti-social où l'authenticité règne et les conventions
              meurent.
            </p>
            <div className="flex space-x-4 md:justify-start justify-center">
              <motion.button
                onClick={handleIconClick("network")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-purple-400 relative group"
                title="Anti-réseautage"
              >
                <UserX className="h-5 w-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  Anti-réseautage
                </span>
              </motion.button>
              <motion.button
                onClick={handleIconClick("comments")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-purple-400 relative group"
                title="Silence imposé"
              >
                <MessageSquareOff className="h-5 w-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  Silence imposé
                </span>
              </motion.button>
              <motion.button
                onClick={handleIconClick("chaos")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-purple-400 relative group"
                title="Manifeste du chaos"
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  Manifeste du chaos
                </span>
              </motion.button>
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/publications"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Publications
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Ressources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Manifeste Anti-Social
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Guide du Chaos
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  FAQ
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Règles de Désordre
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 text-center md:text-left">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Légal
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Conditions d'Utilisation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Politique de Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Cookies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center justify-center md:justify-start"
                >
                  Mentions Légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Asocial. Tous droits réservés. Ou
            pas.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Conçu pour les âmes numériques en quête d'authenticité.
          </p>
        </div>
      </div>

      {/* Toast Messages */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-md shadow-lg border border-purple-500 flex items-center z-50"
          >
            <div className="mr-3">
              {activeToast === "network" && (
                <>
                  <UserX className="h-5 w-5 text-purple-400 inline-block mr-2" />
                  <span>
                    Réseautage rejeté. Nous valorisons l'authenticité, pas les
                    connexions forcées.
                  </span>
                </>
              )}
              {activeToast === "comments" && (
                <>
                  <MessageSquareOff className="h-5 w-5 text-purple-400 inline-block mr-2" />
                  <span>
                    Zone de silence. Pas de commentaires, pas d'avis non
                    sollicités.
                  </span>
                </>
              )}
              {activeToast === "chaos" && (
                <>
                  <AlertTriangle className="h-5 w-5 text-purple-400 inline-block mr-2" />
                  <span>
                    Le chaos est notre philosophie. L'ordre est une illusion.
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-gray-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
