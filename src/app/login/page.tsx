"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Dumbbell, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error, role } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    if (role === "coach") router.push("/coach");
    else if (role === "client") router.push("/client");
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-zinc-500 mt-1">{config.brand.loginSubtitle}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button variant="gold" className="w-full h-12 text-base rounded-xl" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>

        <div className="flex justify-between items-center text-sm mt-6">
          <p className="text-zinc-500">Don&apos;t have an account? <Link href="/signup" className="text-gold font-medium hover:text-gold-light">Sign up</Link></p>
          <Link href="/forgot-password" className="text-zinc-500 hover:text-gold">Forgot password?</Link>
        </div>
        <div className="text-center mt-3">
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
