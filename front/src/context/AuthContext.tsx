import React, { useState, createContext, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  username: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
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
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [token, setToken] = useState<string | null>(storedToken);
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier le token au chargement initial
  useEffect(() => {
    const validateToken = async () => {
      if (token && !user) {
        const decodedUser = decodeToken(token);
        if (!decodedUser) {
          logout();
          return;
        }
        setUser(decodedUser);

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
            logout();
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token :", error);
          logout();
        }
      } else {
        logout();
      }
    };
    validateToken();
  }, []);
  const login = (newToken: string) => {
    const decodedUser = decodeToken(newToken);

    if (!decodedUser) {
      console.error("Token invalide, impossible de se connecter.");
      return;
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(decodedUser));

    setToken(newToken);
    setUser(decodedUser);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = React.useMemo(
    () => ({ user, token, isAuthenticated, login, logout }),
    [user, token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
