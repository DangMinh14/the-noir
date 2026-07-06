"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type AuthResponse, type User } from "./api";

const TOKEN_KEY = "thenoir_token";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  /** True until the stored token has been checked on first load. */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    displayName: string,
    password: string,
  ) => Promise<User>;
  logout: () => void;
  /** Replace the cached user after profile edits. */
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    api<User>("/api/auth/me", { token: stored })
      .then((me) => {
        setToken(stored);
        setUserState(me);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUserState(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      persist(res);
      return res.user;
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, displayName: string, password: string) => {
      const res = await api<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: { email, displayName, password },
      });
      persist(res);
      return res.user;
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, setUser }),
    [user, token, loading, login, register, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
