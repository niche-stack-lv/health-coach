"use client";

/**
 * /reset-password
 *
 * Landing page for the Supabase recovery link (both "forgot password" flow
 * and the coach's "invite a new client" flow).
 *
 * When Supabase's `/auth/v1/verify?type=recovery` succeeds, it redirects here
 * with `access_token` + `refresh_token` in the URL fragment. Supabase-JS
 * auto-parses these on page load and gives us a valid session — we then
 * let the user pick a password via `updateUser({ password })` and route
 * them to their dashboard.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { Dumbbell, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

type Phase = "loading" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [email, setEmail]       = useState("");
  const [role, setRole]         = useState<"coach" | "client" | null>(null);

  // On mount: Supabase-JS reads the URL hash automatically. Give it a beat,
  // then verify we have a valid session before showing the form.
  useEffect(() => {
    const sb = getSupabase();
    // Small delay lets supabase-js finish parsing the URL hash.
    const t = setTimeout(async () => {
      const { data, error } = await sb.auth.getUser();
      if (error || !data.user) {
        setPhase("invalid");
        return;
      }
      setEmail(data.user.email || "");
      // Peek at the profile for post-save routing.
      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.role === "coach" || profile?.role === "client") {
        setRole(profile.role as "coach" | "client");
      }
      setPhase("ready");
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const sb = getSupabase();
    const { error } = await sb.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPhase("success");
    // Brief pause on success screen, then send them to their dashboard.
    setTimeout(() => {
      if (role === "coach") router.push("/coach");
      else if (role === "client") router.push("/client");
      else router.push("/login");
    }, 1400);
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-6 w-6 text-black" />
          </div>
          <p className="text-sm text-zinc-500">Verifying your link…</p>
        </div>
      </div>
    );
  }

  if (phase === "invalid") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-white">Link expired or already used</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Password reset links are single-use and expire after 24 hours. Request a new one and try again.
          </p>
          <Link href="/forgot-password">
            <Button variant="gold" className="mt-6">Request a new link</Button>
          </Link>
          <div className="mt-4">
            <Link href="/login" className="text-sm text-zinc-500 hover:text-gold">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-white">Password set</h1>
          <p className="text-sm text-zinc-400 mt-2">Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set your password</h1>
          {email && (
            <p className="text-sm text-zinc-500 mt-1">
              For <span className="text-zinc-300">{email}</span>
            </p>
          )}
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-gold"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Confirm password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className={inputClass}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button variant="gold" className="w-full h-12 text-base rounded-xl" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Set password and continue"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
