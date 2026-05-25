"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isDemo = searchParams.get("demo") === "true";
  const [gateChecked, setGateChecked] = useState(false);
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (isDemo || loading) return;
    if (!user || role !== "client") { router.replace("/login"); return; }

    // Skip gate checks if already on the gate pages
    if (pathname.includes("/client/change-password") || pathname.includes("/client/onboarding")) {
      setGateChecked(true);
      return;
    }

    // Check password_changed and onboarding_completed
    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase");
        const sb = getSupabase();
        const { data } = await sb.from("clients").select("password_changed, onboarding_completed").eq("id", user.id).single();
        
        if (data && !data.password_changed) {
          setAllowed(false);
          router.replace("/client/change-password");
        } else if (data && !data.onboarding_completed) {
          const { getOnboarding } = await import("@/lib/db");
          const onb = await getOnboarding(user.id);
          if (!onb) {
            setAllowed(false);
            router.replace("/client/onboarding");
          } else {
            await sb.from("clients").update({ onboarding_completed: true }).eq("id", user.id);
            setAllowed(true);
          }
        } else {
          setAllowed(true);
        }
      } catch {
        setAllowed(true);
      }
      setGateChecked(true);
    })();
  }, [user, role, loading, router, isDemo, pathname]);

  if (isDemo) return <>{children}</>;
  if (loading) return <Spinner />;
  if (!user || role !== "client") return null;
  if (!gateChecked) return <Spinner />;
  if (!allowed) return null;
  return <>{children}</>;
}

export function CoachGuard({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}><CoachGuardInner>{children}</CoachGuardInner></Suspense>;
}

export function ClientGuard({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}><ClientGuardInner>{children}</ClientGuardInner></Suspense>;
}
