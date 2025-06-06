import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { RESET_PASSWORD_WITH_TOKEN } from "../mutations/resetPasswordMutation";
import {
  showResetPasswordSuccessToast,
  showResetPasswordErrorToast,
  showInvalidOrExpiredLinkToast,
} from "../utils/customToasts";

export default function ResetPasswordWithTokenPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordWithToken, { loading }] = useMutation(
    RESET_PASSWORD_WITH_TOKEN
  );
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await resetPasswordWithToken({
      variables: { token, username, newPassword },
    });
    if (response.data?.resetPasswordWithToken.success) {
      showResetPasswordSuccessToast();
      navigate("/auth");
    } else if (response.data?.resetPasswordWithToken.code === 400) {
      showInvalidOrExpiredLinkToast();
    } else if (response.data?.resetPasswordWithToken.code === 404) {
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
              Définir un nouveau mot de passe
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                {loading ? "En cours..." : "Valider"}
              </motion.button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/auth" className="text-purple-400 hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
