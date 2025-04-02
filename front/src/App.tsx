import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "./pages/HomePage";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import PublicationDetailsPage from "./pages/PublicationDetailsPage";
import PublicationPage from "./pages/PublicationPage";
import Footer from "./components/Footer";
import ProfilePage from "./pages/ProfilePage";
import { ProtectedRoute, RedirectIfAuthenticated } from "./routes";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

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
