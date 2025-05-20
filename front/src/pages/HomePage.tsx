import { motion } from "framer-motion";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <motion.h1
          className="text-5xl font-bold text-center text-purple-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Bienvenue sur Asocial
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-gray-300 text-center max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          Le réseau anti-social où les pensées profondes, les idées brutes et
          les vraies connexions prennent vie. Pas de likes, pas d'algorithme —
          juste du contenu authentique.
        </motion.p>
        <motion.div
          className="mt-8 flex space-x-4"
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
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            className="px-6 py-3 border border-purple-600 text-purple-400 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            En savoir plus
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}

export default HomePage;
