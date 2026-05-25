"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import { Lock, Check } from "lucide-react";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!user) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  async function handleSubmit() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!user) return;
    setSaving(true);
    setError("");

    const sb = getSupabase();

    // Update password
    const { error: pwError } = await sb.auth.updateUser({ password });
    if (pwError) {
      setError(pwError.message);
      setSaving(false);
      return;
    }

    // Mark password as changed
    await sb.from("clients").update({ password_changed: true }).eq("id", user.id);

    setDone(true);
    setSaving(false);

    // Redirect to onboarding after a short delay
    setTimeout(() => {
      window.location.href = "/client/onboarding";
    }, 1500);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <h1 className="text-xl font-bold text-white">Password Updated!</h1>
        <p className="text-sm text-zinc-400 mt-2">Redirecting to onboarding...</p>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-white">Set Your Password</h1>
          <p className="text-sm text-zinc-500 mt-1">Choose a secure password for your account</p>
        </div>

        <Card className="!p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="Re-enter password"
              className={inputClass}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button variant="gold" className="w-full h-12 text-base rounded-xl" onClick={handleSubmit} disabled={saving}>
            {saving ? "Updating..." : "Set Password"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
