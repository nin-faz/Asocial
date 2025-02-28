import React, { useState, createContext, ReactNode } from "react";

interface User {
  username: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (value: { user: User; token: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") ?? null
  );

  const login = (value: { user: User; token: string }) => {
    localStorage.setItem("token", value.token);
    localStorage.setItem("user", JSON.stringify(value.user));
    setToken(value.token);
    setUser(value.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = React.useMemo(
    () => ({ user, token, login, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
