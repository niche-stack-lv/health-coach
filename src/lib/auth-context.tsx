"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { getSupabase } from "./supabase";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

type UserRole = "coach" | "client" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
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
      setUserStable(setUser, data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      else setLoading(false);
    });
    // IMPORTANT: Supabase fires onAuthStateChange on every token refresh
    // (~hourly, or on tab focus after sleep). If we naively setUser on each
    // event, downstream useEffects with `[user]` deps re-run and unsaved
    // form state in editors gets blown away. We only update the React state
    // when the user identity actually changed (id or signed in/out), not
    // when only the JWT was rotated.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      // Always keep the session ref up to date (it carries the new access token
      // for downstream Supabase queries). The user identity check below
      // gates only the React user/role state.
      setSession(sess);

      if (event === "TOKEN_REFRESHED") {
        // Pure token rotation — do NOT touch user/role state.
        return;
      }
      if (event === "SIGNED_OUT" || !sess?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      // SIGNED_IN, USER_UPDATED, INITIAL_SESSION, etc.
      setUserStable(setUser, sess.user);
      if (event !== "USER_UPDATED") {
        // role is keyed off the profile; only re-fetch when we don't already
        // have one (initial sign in) or when explicitly told it changed.
        fetchRoleIfNeeded(sess.user.id);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await sb().from("profiles").select("role").eq("id", userId).single();
    if (data) setRole(data.role as UserRole);
    setLoading(false);
  }

  // Skip role refetch if we already have one and user id is unchanged
  const lastRoleUserIdRef = useRef<string | null>(null);
  async function fetchRoleIfNeeded(userId: string) {
    if (lastRoleUserIdRef.current === userId && role) {
      setLoading(false);
      return;
    }
    lastRoleUserIdRef.current = userId;
    await fetchRole(userId);
  }

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
    lastRoleUserIdRef.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Only call setUser when the actual user identity changed.
 * Supabase returns a fresh User object reference on every token refresh
 * even though the underlying user is the same; passing that to setState
 * causes every component that depends on `user` to re-render and re-run
 * its effects.
 */
function setUserStable(setUser: Dispatch<SetStateAction<User | null>>, next: User | null) {
  setUser((prev) => {
    if (prev === next) return prev;
    if (prev?.id && next?.id && prev.id === next.id) {
      // Same user — keep the previous reference so React doesn't see a change.
      return prev;
    }
    return next;
  });
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
