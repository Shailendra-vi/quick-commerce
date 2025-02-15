"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthContextType, User } from "@/types/type";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/utils/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const router = useRouter();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUserRole();
    } else {
      localStorage.removeItem("token");
      setUser(null)
    }
  }, [token]);

  async function fetchUserRole() {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
      } else {
        router.push("/signin");
      }
    } catch (error) {
      console.log((error as Error).message);
    }
  }

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/signin");
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (token) {
      const decodedToken = decodeToken(token);
      if (typeof decodedToken !== "string" && decodedToken?.exp) {
        const expiresIn = decodedToken.exp * 1000 - Date.now();
        interval = setTimeout(refreshToken, expiresIn - 60000);
      }
    }
    return () => clearTimeout(interval);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
