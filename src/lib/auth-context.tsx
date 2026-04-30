"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { getSupabase } from "./supabase";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

type UserRole = "coach" | "client" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: "coach" | "client") => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const sbRef = useRef<SupabaseClient | null>(null);

  function sb() {
    if (!sbRef.current) sbRef.current = getSupabase();
    return sbRef.current;
  }

  useEffect(() => {
    const supabase = sb();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchRole(sess.user.id);
      else { setRole(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await sb().from("profiles").select("role").eq("id", userId).single();
    if (data) setRole(data.role as UserRole);
    setLoading(false);
  }

  const signUp = async (email: string, password: string, name: string, role: "coach" | "client") => {
    const { data, error } = await sb().auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await sb().from("profiles").insert({ id: data.user.id, email, name, role });
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await sb().auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null as UserRole };
    if (data.user) {
      const { data: profile } = await sb().from("profiles").select("role").eq("id", data.user.id).single();
      const userRole = (profile?.role as UserRole) || null;
      setRole(userRole);
      return { error: null, role: userRole };
    }
    return { error: "Unknown error", role: null as UserRole };
  };

  const signOut = async () => {
    await sb().auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
