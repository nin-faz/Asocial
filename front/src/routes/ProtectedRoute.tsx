import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/" }: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { user, verifyToken } = authContext;

  // Vérification immédiate de l'existence d'un utilisateur
  if (!user) {
    // Si pas d'utilisateur, rediriger immédiatement (sans attendre la vérification)
    return <Navigate to={redirectPath} replace />;
  }

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Seulement vérifier le token si un utilisateur existe
        if (user) {
          const valid = await verifyToken();
          setIsAuthenticated(valid);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [user, verifyToken]);

  // Pendant la vérification
  if (isVerifying) {
    return null; // ou un composant de chargement
  }

  // Si le token n'est pas valide, rediriger
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Utilisateur authentifié avec un token valide
  return <Outlet />;
};

export default ProtectedRoute;
