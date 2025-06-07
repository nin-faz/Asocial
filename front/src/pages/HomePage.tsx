import { motion } from "framer-motion";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DownloadIcon } from "lucide-react";

function HomePage() {
  const navigate = useNavigate();

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { user } = authContext;

  useEffect(() => {
    document.title = "Accueil";
  }, []);
  return (
    <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-16">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-purple-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Bienvenue sur Asocial
        </motion.h1>
        <motion.p
          className="mt-4 text-base sm:text-lg text-gray-300 text-center max-w-2xl px-2 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          Le réseau anti-social où les pensées profondes, les idées brutes et
          les vraies connexions prennent vie. Pas de likes, pas d'algorithme —
          juste du contenu authentique.
        </motion.p>{" "}
        <motion.div
          className="mt-8 flex flex-row sm:space-y-0 space-x-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.button
            transition={{ delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              !user ? navigate("/auth") : navigate("/publications");
            }}
            className="px-4 py-3 sm:px-6 sm:py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {!user ? "Rejoindre le" : "Participier au"} chaos
          </motion.button>
          <motion.button
            transition={{ delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/about")}
            className="px-4 py-3 sm:px-6 sm:py-3 text-sm sm:text-base border border-purple-600 text-purple-400 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            En savoir plus
          </motion.button>
        </motion.div>
        <motion.button
          transition={{ duration: 1, delay: 0.5 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
            transition: { duration: 0.15 },
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/install-tuto")}
          className="flex sm:hidden mt-4 px-4 py-3 text-sm bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
        >
          {" "}
          <DownloadIcon className="w-6 h-5 pr-2" />
          Installer Asocial en 2 clics
        </motion.button>
      </div>
    </main>
  );
}

export default HomePage;
