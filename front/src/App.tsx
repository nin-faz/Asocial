import { BrowserRouter as Router, Routes, Route } from "react-router";
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
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/publications/*" element={<PublicationPage />} />
            <Route
              path="/publications/:id"
              element={<PublicationDetailsPage />}
            />

            <ProfilePage />

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
