"use client";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";


type AuthContextValue = {
  user: User | null ;
  loading: boolean;
  logout: () => Promise<void>;
};

// format authcontext emang kayak gini, menyimpan data user ketika berhasil login, bakal di panggil di layout
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider ({ children }: { children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user, loading, logout: () => signOut(auth),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
}