import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect, useState, useContext } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import PublicationDetailsPage from "./pages/PublicationDetailsPage";
import PublicationPage from "./pages/PublicationPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthContext } from "./context/AuthContext";
import { ProtectedRoute, RedirectIfAuthenticated } from "./routes";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const authContext = useContext(AuthContext);

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
        setTimeout(() => setIsLoading(false), 2000);
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

      <Router>
        <Header />
        <div className="min-h-screen bg-black">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/publications/*" element={<PublicationPage />} />
            <Route
              path="/publications/:id"
              element={<PublicationDetailsPage />}
            />
            <Route path="/about" element={<AboutPage />} />

            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
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
      </Router>
    </>
  );
}

export default App;
