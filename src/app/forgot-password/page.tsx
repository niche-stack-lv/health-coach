"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { Dumbbell, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = getSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 mx-auto"><Check className="h-8 w-8 text-gold" /></div>
          <h1 className="text-xl font-bold text-white">Check Your Email</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">We sent a password reset link to {email}</p>
          <Link href="/login"><Button variant="gold" className="mt-6">Back to Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-4"><Dumbbell className="h-6 w-6 text-black" /></div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your email and we&apos;ll send a reset link</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>}
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
            </div>
            <Button variant="gold" className="w-full h-12 text-base rounded-xl" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Card>
        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-zinc-500 hover:text-gold"><ArrowLeft className="h-3.5 w-3.5 inline mr-1" />Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
