import { motion } from "framer-motion";
import { Skull, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-purple-900 sm:flex sm:justify-center sm:items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Skull className="h-8 w-8 text-purple-500" />
              <span className="ml-2 text-2xl font-bold text-purple-400">
                Asocial
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Le réseau anti-social où l'authenticité règne et les conventions
              meurent.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="mailto:chaos@asocial.com"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-purple-400"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/publications"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Publications
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Ressources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  Manifeste Anti-Social
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  Guide du Chaos
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  FAQ
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  Règles de Désordre
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Légal
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Conditions d'Utilisation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Politique de Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Cookies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
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
    </footer>
  );
};

export default Footer;
