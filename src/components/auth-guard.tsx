"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );
}

function CoachGuardInner({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (isDemo || loading) return;
    if (!user || role !== "coach") router.replace("/login");
  }, [user, role, loading, router, isDemo]);

  // Demo mode: always render
  if (isDemo) return <>{children}</>;
  // Loading: show spinner
  if (loading) return <Spinner />;
  // Authenticated coach: render
  if (user && role === "coach") return <>{children}</>;
  // Otherwise: null (redirect happening in useEffect)
  return null;
}

function ClientGuardInner({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (isDemo || loading) return;
    if (!user || role !== "client") router.replace("/login");
  }, [user, role, loading, router, isDemo]);

  if (isDemo) return <>{children}</>;
  if (loading) return <Spinner />;
  if (user && role === "client") return <>{children}</>;
  return null;
}

export function CoachGuard({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}><CoachGuardInner>{children}</CoachGuardInner></Suspense>;
}

export function ClientGuard({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}><ClientGuardInner>{children}</ClientGuardInner></Suspense>;
}
