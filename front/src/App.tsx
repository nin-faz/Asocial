import React, { Suspense, useContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Loader from "./components/Loader";
import Header from "./components/fragments/Header";
import Footer from "./components/fragments/Footer";
// Lazy load pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const InstallTutoPage = React.lazy(() => import("./pages/InstallTutoPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const PublicationPage = React.lazy(
  () => import("./pages/publications/PublicationPage")
);
const PublicationDetailsPage = React.lazy(
  () => import("./pages/publications/PublicationDetailsPage")
);
const UserProfilePage = React.lazy(() => import("./pages/UserProfilePage"));
const RequestPasswordResetPage = React.lazy(
  () => import("./pages/RequestPasswordResetPage")
);
const ResetPasswordWithTokenPage = React.lazy(
  () => import("./pages/ResetPasswordWithTokenPage")
);
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const LeaderboardPage = React.lazy(() => import("./pages/LeaderboardPage"));
import { ProtectedRoute, RedirectIfAuthenticated } from "./routes";
import { AuthContext } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

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
          <Route
            path="/"
            element={
              <Suspense fallback={<Loader />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/install-tuto"
            element={
              <Suspense fallback={<Loader />}>
                <InstallTutoPage />
              </Suspense>
            }
          />
          <Route
            path="/publications/*"
            element={
              <Suspense fallback={<Loader />}>
                <PublicationPage />
              </Suspense>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Suspense fallback={<Loader />}>
                <ResetPasswordWithTokenPage />
              </Suspense>
            }
          />
          <Route
            path="/request-password-reset"
            element={
              <Suspense fallback={<Loader />}>
                <RequestPasswordResetPage />
              </Suspense>
            }
          />
          <Route
            path="/publications/:id"
            element={
              <Suspense fallback={<Loader />}>
                <PublicationDetailsPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<Loader />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <Suspense fallback={<Loader />}>
                <UserProfilePage />
              </Suspense>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <Suspense fallback={<Loader />}>
                <LeaderboardPage />
              </Suspense>
            }
          />

          <Route element={<RedirectIfAuthenticated />}>
            <Route
              path="/auth"
              element={
                <Suspense fallback={<Loader />}>
                  <AuthPage />
                </Suspense>
              }
            />
          </Route>

          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/profile"
              element={
                <Suspense fallback={<Loader />}>
                  <MyProfilePage />
                </Suspense>
              }
            />
            <Route
              path="/notifications"
              element={
                <Suspense fallback={<Loader />}>
                  <NotificationsPage />
                </Suspense>
              }
            />
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
