import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/" }: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { isAuthenticated } = authContext;

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Utilisateur authentifié avec un token valide
  return <Outlet />;
};

export default ProtectedRoute;
