"use client";

import { useState, useEffect, Suspense } from "react";
import { Camera, Upload, Scale, MessageSquare, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useIsDemo } from "@/lib/use-demo";

const photoTypes = [
  { type: "front", label: "Front" },
  { type: "side", label: "Side" },
  { type: "back", label: "Back" },
] as const;

function CheckInContent() {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already submitted this week (Mon-Sun)
  useEffect(() => {
    if (isDemo) { setChecking(false); return; }
    if (!user) return;
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon...
    const diff = day === 0 ? 6 : day - 1; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    const mondayStr = monday.toISOString().split("T")[0];

    const sb = getSupabase();
    sb.from("check_ins")
      .select("id")
      .eq("client_id", user.id)
      .gte("date", mondayStr)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setAlreadySubmitted(true);
        setChecking(false);
      });
  }, [user, isDemo]);

  if (checking) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  if (alreadySubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-emerald-400" /></div>
        <h1 className="text-xl font-bold text-white">Already Submitted This Week</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xs">You&apos;ve already submitted your weekly check-in. Come back next Monday!</p>
      </div>
    );
  }

  const handleFileChange = (type: string, file: File | null) => {
    setPhotos((p) => ({ ...p, [type]: file }));
  };

  const handleSubmit = async () => {
    if (isDemo) {
      setUploading(true);
      setTimeout(() => { setUploading(false); setSubmitted(true); }, 800);
      return;
    }
    if (!user) return;
    setUploading(true);
    const sb = getSupabase();
    const photoUrls: string[] = [];

    // Upload photos
    for (const [type, file] of Object.entries(photos)) {
      if (!file) continue;
      const path = `${user.id}/${Date.now()}_${type}.${file.name.split(".").pop()}`;
      const { error } = await sb.storage.from("check-in-photos").upload(path, file);
      if (!error) photoUrls.push(path);
    }

    // Save check-in
    await sb.from("check_ins").insert({
      client_id: user.id,
      date: new Date().toISOString().split("T")[0],
      weight: weight ? Number(weight) : null,
      notes: notes || null,
      photos: photoUrls,
      status: "pending",
    });

    setUploading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-gold" /></div>
        <h1 className="text-xl font-bold text-white">Check-in Submitted!</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xs">Your coach will review your progress and get back to you soon.</p>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Weekly Check-in</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Submit your progress</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4"><Camera className="h-4 w-4 text-gold" /><p className="text-sm font-semibold text-white">Progress Photos</p></div>
        <div className="grid grid-cols-3 gap-3">
          {photoTypes.map(({ type, label }) => (
            <label key={type} className={cn("relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
              photos[type] ? "border-gold/50 bg-gold/5" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
            )}>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)} />
              {photos[type] ? (<><Check className="h-6 w-6 text-gold" /><span className="text-xs font-medium text-gold">Added</span></>) : (<><Upload className="h-5 w-5 text-zinc-500" /><span className="text-xs text-zinc-500">{label}</span></>)}
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4"><Scale className="h-4 w-4 text-gold" /><p className="text-sm font-semibold text-white">Weight</p></div>
        <div className="relative">
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Enter weight" className={inputClass} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">kg</span>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4"><MessageSquare className="h-4 w-4 text-gold" /><p className="text-sm font-semibold text-white">Notes for Coach</p></div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How was your week?" rows={4} className={cn(inputClass, "resize-none")} />
      </Card>

      <Button variant="gold" className="w-full h-12 text-base rounded-2xl" onClick={handleSubmit} disabled={uploading}>
        {uploading ? "Submitting..." : "Submit Check-in"}
      </Button>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <CheckInContent />
    </Suspense>
  );
}
