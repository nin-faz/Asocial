import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import HomePage from "./pages/HomePage";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";

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
      </Router>
    </>
  );
}

export default App;
