import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface RedirectIfAuthenticatedProps {
  redirectPath?: string;
}

const RedirectIfAuthenticated = ({
  redirectPath = "/",
}: RedirectIfAuthenticatedProps) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { user } = authContext;

  // Si l'utilisateur est connecté, rediriger vers la page d'accueil
  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Si l'utilisateur n'est pas connecté, afficher les composants enfants
  return <Outlet />;
};

export default RedirectIfAuthenticated;
