import { motion } from "framer-motion";
import { useEffect } from "react";

function InstallTutoPage() {
  useEffect(() => {
    document.title = "Installer Asocial sur mobile";
  }, []);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-10 flex flex-col items-center">
      <motion.h1
        className="text-2xl text-center font-semibold mb-8 text-purple-300"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Comment ajouter Asocial sur votre téléphone ?
      </motion.h1>
      <motion.div
        className="bg-purple-900/30 rounded-lg p-6 text-gray-200 text-center shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <div className="flex flex-col items-center gap-8 text-sm">
          {/* Étape 1 */}
          <div className="flex flex-col items-center w-full">
            <div className="mx-auto mb-3 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors">
              Étape 1 : Ouvrez Asocial dans le navigateur de votre téléphone et
              appuyez sur l'icône entourée
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/stepsTuto/step1.PNG"
                alt="Ouvrir Asocial"
                className="max-w-xs rounded-md border border-purple-700 shadow"
              />
            </div>
          </div>
          {/* Étape 2 */}
          <div className="flex flex-col items-center w-full">
            <div className="mx-auto mb-3 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors">
              Étape 2 : Sélectionnez "Sur écran d'accueil"
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/stepsTuto/step2.PNG"
                alt="Menu navigateur"
                className="max-w-xs rounded-md border border-purple-700 shadow"
              />
            </div>
          </div>
          {/* Étape 3 */}
          <div className="flex flex-col items-center w-full">
            <div className="mx-auto mb-3 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors">
              Étape 3 : Cliquez sur « Ajouter »
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/stepsTuto/step3.PNG"
                alt="Ajouter à l'écran d'accueil"
                className="max-w-xs rounded-md border border-purple-700 shadow"
              />
            </div>
          </div>
        </div>
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-lg text-purple-300 font-semibold">
            🎉 Bienvenue dans l'expérience Asocial comme une vraie app !
          </p>
          <p className="mt-2 text-sm text-purple-100">
            Tu peux maintenant l’ouvrir depuis ton écran d’accueil, sans passer
            par le navigateur.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-block px-5 py-3 bg-purple-700 text-white rounded-full shadow-md hover:bg-purple-800 transition-colors"
          >
            🔙 Revenir à Asocial
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default InstallTutoPage;
