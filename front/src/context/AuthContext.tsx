import React, { useState, createContext, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { User } from "lucide-react";

interface User {
  username: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const decodeToken = (token: string): User | null => {
  if (!token) {
    console.error("Aucun token fourni pour le décodage.");
    return null;
  }

  try {
    const decoded: any = jwtDecode(token);
    return { id: decoded.id, username: decoded.username };
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error);
    return null;
  }
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedToken = sessionStorage.getItem("token");
  const storedUser = sessionStorage.getItem("user");

  const [token, setToken] = useState<string | null>(storedToken);
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  // Fonction pour vérifier la validité du token avec le serveur
  const verifyToken = async (): Promise<boolean> => {
    if (!token || !user) {
      console.log("Pas de token ou d'utilisateur à vérifier");
      logout();
      return false;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log("Le token n'est plus valide côté serveur");
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      logout();
      return false;
    }
  };

  // Vérifier le token au chargement initial
  useEffect(() => {
    const validateOnLoad = async () => {
      if (token && !user) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          logout();
          return;
        }
      }

      if (token) {
        await verifyToken();
      }
    };

    validateOnLoad();
  }, []);

  const login = (token: string) => {
    const decodedUser = decodeToken(token);

    if (!decodedUser) {
      console.error("Token invalide, impossible de se connecter.");
      return;
    }

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(decodedUser));

    setToken(token);
    setUser(decodedUser);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  const value = React.useMemo(
    () => ({ user, token, login, logout, verifyToken }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
