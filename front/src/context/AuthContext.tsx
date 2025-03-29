import React, { useState, createContext, ReactNode } from "react";
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
    console.log("Token  :" + JSON.stringify(token));
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
    () => ({ user, token, login, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
