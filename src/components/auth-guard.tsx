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

  const onGatePage =
    pathname.includes("/client/change-password") ||
    pathname.includes("/client/onboarding");

  useEffect(() => {
    // Cancellation flag: if pathname changes mid-async (because we called
    // router.replace inside the async), we must NOT let the stale async
    // clobber state that a subsequent effect run already reset. Without this,
    // the target gate page (e.g. /client/onboarding) renders a black screen
    // because `allowed` gets flipped back to false by the stale async.
    let cancelled = false;

    if (isDemo || loading) return;
    if (!user || role !== "client") { router.replace("/login"); return; }

    // Gate pages skip the check entirely and are always rendered. Reset
    // `allowed` so a stale false from a prior run doesn't blank the page.
    if (onGatePage) {
      setAllowed(true);
      setGateChecked(true);
      return () => { cancelled = true; };
    }

    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase");
        const sb = getSupabase();
        const { data } = await sb
          .from("clients")
          .select("password_changed, onboarding_completed")
          .eq("id", user.id)
          .single();
        if (cancelled) return;

        if (data && !data.password_changed) {
          router.replace("/client/change-password");
          return; // let the next effect run reset state on the gate page
        }
        if (data && !data.onboarding_completed) {
          const { getOnboarding } = await import("@/lib/db");
          const onb = await getOnboarding(user.id);
          if (cancelled) return;
          if (!onb) {
            router.replace("/client/onboarding");
            return;
          }
          await sb.from("clients").update({ onboarding_completed: true }).eq("id", user.id);
        }
        if (cancelled) return;
        setAllowed(true);
        setGateChecked(true);
      } catch {
        if (cancelled) return;
        setAllowed(true);
        setGateChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user, role, loading, router, isDemo, pathname, onGatePage]);

  if (isDemo) return <>{children}</>;
  if (loading) return <Spinner />;
  if (!user || role !== "client") return null;
  // Gate pages always render immediately once we know the user is a client;
  // no data fetch needed.
  if (onGatePage) return <>{children}</>;
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
