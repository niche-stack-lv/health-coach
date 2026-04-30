"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Dumbbell, Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name, "client");
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 mx-auto">
            <Check className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-white">Account Created!</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">Check your email to verify your account, then sign in.</p>
          <Link href="/login"><Button variant="gold" className="mt-6">Go to Sign In</Button></Link>
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
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-zinc-500 mt-1">{config.brand.signupSubtitle}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputClass} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button variant="gold" className="w-full h-12 text-base rounded-xl" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gold font-medium hover:text-gold-light">Sign in</Link>
        </p>
        <div className="text-center mt-3">
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
