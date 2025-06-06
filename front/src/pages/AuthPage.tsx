import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_USER, SIGN_IN } from "../mutations";
import { AuthContext } from "../context/AuthContext";
import {
  showEmptyInfoToLogin,
  showEmptyInfoToRegister,
  showLoginToast,
  // showReconnectToast,
  showWelcomeToast,
} from "../utils/customToasts";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // useEffect(() => {
  //   const CURRENT_APP_VERSION = import.meta.env.VITE_APP_VERSION;
  //   const storedVersion = localStorage.getItem("app_version");

  //   if (storedVersion != CURRENT_APP_VERSION) {
  //     console.log("ok");
  //     showReconnectToast();
  //   }
  // }, []);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? "Connexion" : "Inscription";
  }, [isLogin]);

  const [createUser, { loading: isRegistering }] = useMutation(CREATE_USER);
  const [signIn, { loading: isLoggingIn }] = useMutation(SIGN_IN);

  const isSubmitting = isRegistering || isLoggingIn;

  let buttonText = "";

  if (isSubmitting) {
    buttonText = isLogin ? "Connexion en cours..." : "Inscription en cours...";
  } else {
    buttonText = isLogin ? "Se connecter" : "Créer un compte";
  }

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }
  const { login } = authContext;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (username === "" || password === "") {
        showEmptyInfoToRegister();
        return;
      }

      const response = await createUser({
        variables: { username, password },
      });

      if (response.data?.createUser?.success) {
        const signInResponse = await signIn({
          variables: { username, password },
        });

        if (signInResponse.data?.signIn?.success) {
          login(signInResponse.data.signIn.token ?? "");

          showWelcomeToast();
          console.log("inscription réussie, bienvenue dans le chaos !");

          navigate("/publications");
        }
      } else {
        toast.error(
          response.data?.createUser?.message ||
            "Une erreur est survenue lors de l'inscription"
        );
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (username === "" || password === "") {
        showEmptyInfoToLogin();
        return;
      }
      const response = await signIn({
        variables: { username, password },
      });

      if (response.data?.signIn?.success) {
        login(response.data.signIn.token ?? "");

        showLoginToast();
        console.log("Connexion réussie, bienvenue dans le chaos !");

        navigate("/publications");
      } else {
        toast.error(response.data?.signIn?.message || "Échec de la connexion");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/logo.svg"
              alt="Logo Asocial"
              className="flex items-center cursor-pointer w-16 h-16 rounded-full border-2 border-gray-500"
            />
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

            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-6"
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
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
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg transition-colors ${
                  isSubmitting
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {buttonText}
              </motion.button>
            </form>

            {isLogin && (
              <div className="mt-4 text-center">
                <Link
                  to="/reset-password"
                  className="text-purple-400 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

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
