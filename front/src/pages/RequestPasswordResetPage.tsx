import { useState } from "react";
import { useMutation } from "@apollo/client";
import { REQUEST_PASSWORD_RESET } from "../mutations/resetPasswordMutation";
import { motion } from "framer-motion";
import { User, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  showResetPasswordErrorToast,
  showResetPasswordEmailSentToast,
} from "../utils/customToasts";

export default function RequestPasswordResetPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [requestPasswordReset, { loading }] = useMutation(
    REQUEST_PASSWORD_RESET
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await requestPasswordReset({
      variables: { email, username },
    });
    if (response.data?.requestPasswordReset.success) {
      showResetPasswordEmailSentToast();
      setSubmitted(true);
    } else {
      showResetPasswordErrorToast();
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
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
              Demander la réinitialisation du mot de passe
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
                  required
                />
              </div>
              <motion.button
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                disabled={loading}
                className={`w-full py-3 rounded-lg transition-colors ${
                  loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {loading
                  ? "En cours..."
                  : "Envoyer le lien de réinitialisation"}
              </motion.button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/auth" className="text-purple-400 hover:underline">
                Retour à la connexion
              </Link>
            </div>
            {submitted && (
              <div className="mt-4 text-center text-gray-400 text-sm">
                Si l'adresse existe, un email a été envoyé.
                <br />
                <span className="text-xs">
                  {" "}
                  Ps : possibilité de se retrouver dans les spams
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
