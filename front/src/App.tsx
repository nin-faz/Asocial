import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useContext, useEffect, useState } from "react";
import Loader from "./components/Loader";
import Header from "./components/fragments/Header";
import Footer from "./components/fragments/Footer";
import HomePage from "./pages/HomePage";
import InstallTutoPage from "./pages/InstallTutoPage";
import AuthPage from "./pages/AuthPage";
import MyProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import PublicationPage from "./pages/publications/PublicationPage";
import PublicationDetailsPage from "./pages/publications/PublicationDetailsPage";
import UserProfilePage from "./pages/UserProfilePage";
import RequestPasswordResetPage from "./pages/RequestPasswordResetPage";
import ResetPasswordWithTokenPage from "./pages/ResetPasswordWithTokenPage";
import { ProtectedRoute, RedirectIfAuthenticated } from "./routes";
import { AuthContext } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import NotificationsPage from "./pages/NotificationsPage";
import LeaderboardPage from "./pages/LeaderboardPage";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { logout, token, user } = authContext;

  useEffect(() => {
    const CURRENT_APP_VERSION = __APP_VERSION__;
    const storedVersion = localStorage.getItem("app_version");

    if (storedVersion !== CURRENT_APP_VERSION) {
      console.log("🔄 Nouvelle version détectée, nettoyage en cours...");

      if (token && user) {
        logout();

        localStorage.setItem("redirect_after_update", "true");

        navigate("/auth");
      }
      localStorage.setItem("app_version", CURRENT_APP_VERSION);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Vérification du token au chargement
        if (authContext?.token && authContext?.user) {
          await authContext.verifyToken();
        } else if (authContext?.token && !authContext?.user) {
          // Si nous avons un token mais pas d'utilisateur, supprimer le token
          authContext.logout();
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'initialisation de l'application:",
          error
        );
      } finally {
        // Continue avec le chargement normal
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    init();
  }, [authContext]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <ToastContainer
        className={"text-center"}
        position="top-right"
        autoClose={3000}
        hideProgressBar
      />

      <Header />
      <div className="min-h-screen bg-black">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/install-tuto" element={<InstallTutoPage />} />
          <Route path="/publications/*" element={<PublicationPage />} />
          <Route
            path="/reset-password"
            element={<ResetPasswordWithTokenPage />}
          />
          <Route
            path="/request-password-reset"
            element={<RequestPasswordResetPage />}
          />
          <Route
            path="/publications/:id"
            element={<PublicationDetailsPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route
            path="*"
            element={
              <h1 className="flex items-center justify-center h-screen text-white text-4xl font-bold">
                404 - Not Found
              </h1>
            }
          />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
