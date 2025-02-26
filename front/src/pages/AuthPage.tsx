import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skull, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = isLogin ? "Connexion" : "Inscription";
  }, [isLogin]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Skull className="h-16 w-16 text-purple-500" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 p-8 rounded-lg shadow-xl border border-purple-900"
          >
            <div className="flex mb-8">
              <button
                className={`flex-1 py-2 text-center transition-colors ${
                  isLogin
                    ? "text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Connexion
              </button>
              <button
                className={`flex-1 py-2 text-center transition-colors ${
                  !isLogin
                    ? "text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="w-full bg-gray-800 text-gray-100 pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isLogin ? "Se connecter" : "Créer un compte"}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-gray-500 text-sm">
              {isLogin ? (
                <>
                  Pas encore de compte ?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Rejoindre le chaos
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

export default AuthPage;
