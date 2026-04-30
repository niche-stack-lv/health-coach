"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/db";
import { Check } from "lucide-react";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50";

function SettingsContent() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    const profile = await getProfile(user.id);
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const result = await updateProfile(user.id, { name, email });
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h2 className="text-base font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
            )}
            {saved && (
              <div className="flex items-center gap-2 rounded-lg bg-gold/10 border border-gold/20 px-4 py-3">
                <Check className="h-4 w-4 text-gold" />
                <span className="text-sm text-gold font-medium">Changes saved!</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
          </div>
          <Button variant="gold" className="mt-4" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
