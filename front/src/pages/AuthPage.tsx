import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, Skull, Flame } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_USER, SIGN_IN } from "../gql/mutations";

interface CreateUserResponse {
  createUser: {
    success: boolean;
    message: string;
    user: {
      id: string;
      username: string;
    };
  };
}

interface SignInResponse {
  signIn: {
    success: boolean;
    token: string;
    message: string;
  };
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? "Connexion" : "Inscription";
  }, [isLogin]);

  const [createUser] = useMutation<CreateUserResponse>(CREATE_USER);
  const [signIn] = useMutation<SignInResponse>(SIGN_IN);

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }
  const { login } = authContext;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await createUser({
        variables: { username, password },
      });

      if (response.data?.createUser?.success) {
        const signInResponse = await signIn({
          variables: { username, password },
        });

        if (signInResponse.data?.signIn?.success) {
          login({
            user: response.data.createUser.user,
            token: signInResponse.data.signIn.token,
          });
          toast.success(
            "T’as fait le pire choix possible. Mais bon, bienvenue quand même.",
            {
              icon: <Skull size={24} color="#f0aaff" />,
              style: { background: "#2a0134", color: "#f0aaff" },
            }
          );
          navigate("/publications");
        } else {
          toast.success("Inscription réussie, tu y es presque ...", {
            style: { background: "#2a0134", color: "#f0aaff" },
          });
          navigate("/auth");
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
      const response = await signIn({
        variables: { username, password },
      });

      if (response.data?.signIn?.success) {
        login({
          user: { username },
          token: response.data.signIn.token,
        });
        const darkMessages = [
          "Revoilà l'anti-héros... enfin, juste un type paumé.",
          "Bienvenue dans l'abîme. L'espoir n'a jamais eu sa place ici.",
          "Encore toi ? On a toujours pas activé l’option éjection.",
          "Tu t’accroches, hein ? C’est presque touchant.",
          "Connexion réussie... mais à quoi bon ?",
        ];

        toast.success(
          darkMessages[Math.floor(Math.random() * darkMessages.length)],
          {
            icon: <Flame size={24} color="#f0aaff" />,
            style: { background: "#2a0134", color: "#f0aaff" },
          }
        );
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
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
