import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

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
          Bienvenu sur Asocial
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
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Rejoindre le chaos
          </button>
          <button
            onClick={() => navigate("/about")}
            className="px-6 py-3 border border-purple-600 text-purple-400 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            En savoir plus
          </button>
        </motion.div>
      </div>
    </main>
  );
}

export default HomePage;
