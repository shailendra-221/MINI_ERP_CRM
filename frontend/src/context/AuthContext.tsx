import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, Role } from "../api/types";
import { loginRequest, registerRequest } from "../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("erp_user");
    const token = localStorage.getItem("erp_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("erp_user");
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { token, user: loggedInUser } = await loginRequest(email, password);
    localStorage.setItem("erp_token", token);
    localStorage.setItem("erp_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function register(name: string, email: string, password: string, role: Role = "SALES") {
    const { token, user: loggedInUser } = await registerRequest(name, email, password, role);
    localStorage.setItem("erp_token", token);
    localStorage.setItem("erp_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    setUser(null);
  }

  function hasRole(...roles: Role[]) {
    return !!user && roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
