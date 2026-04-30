"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Dumbbell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { saveLead } from "@/lib/db";
import { config } from "@/lib/config";

const WHATSAPP_NUMBER = config.contact.whatsappNumber;

const goals = ["Fat Loss", "Muscle Gain", "Body Recomposition", "Competition Prep", "General Fitness"];
const experience = ["Beginner (< 1 year)", "Intermediate (1-3 years)", "Advanced (3+ years)"];
const dietTypes = ["Non-Vegetarian", "Vegetarian", "Eggetarian", "Vegan"];
const gymAccess = ["Yes, I go to a gym", "No, home workouts only", "I have a home gym"];
const sources = ["Instagram", "YouTube", "Friend / Referral", "Google", "Other"];

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

function OptionGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={cn("rounded-xl border px-4 py-3 text-sm text-left font-medium transition-all active:scale-[0.98]",
            value === opt ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]"
          )}>{opt}</button>
      ))}
    </div>
  );
}

export default function EnquiryPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", phone: "", age: "", gender: "",
    weight: "", height: "", goal: "", exp: "",
    diet: "", gym: "", injuries: "",
    source: "", message: "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const totalSteps = 4;

  const canNext = () => {
    if (step === 0) return form.name && form.phone;
    if (step === 1) return form.goal;
    return true;
  };

  const handleSubmit = async () => {
    // Save lead to Supabase
    await saveLead({
      source: "enquiry",
      name: form.name,
      phone: form.phone,
      goal: form.goal,
      age: form.age,
      gender: form.gender,
      weight: form.weight,
      height: form.height,
      diet: form.diet,
      gym: form.gym,
      experience: form.exp,
      injuries: form.injuries,
      referral_source: form.source,
      message: form.message,
    });

    const lines = [
      `🏋️ *New Enquiry from ${config.brand.name}*`,
      ``,
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      form.age ? `*Age:* ${form.age}` : "",
      form.gender ? `*Gender:* ${form.gender}` : "",
      ``,
      form.weight ? `*Weight:* ${form.weight} kg` : "",
      form.height ? `*Height:* ${form.height} cm` : "",
      `*Goal:* ${form.goal}`,
      form.exp ? `*Experience:* ${form.exp}` : "",
      ``,
      form.diet ? `*Diet:* ${form.diet}` : "",
      form.gym ? `*Gym Access:* ${form.gym}` : "",
      form.injuries ? `*Injuries/Conditions:* ${form.injuries}` : "",
      ``,
      form.source ? `*Found via:* ${form.source}` : "",
      form.message ? `*Message:* ${form.message}` : "",
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
    setStep(totalSteps);
  };

  if (step === totalSteps) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 mx-auto"><Check className="h-8 w-8 text-gold" /></div>
          <h1 className="text-xl font-bold text-white">Enquiry Sent!</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">Coach {config.coach.firstName} will get back to you on WhatsApp shortly.</p>
          <Link href="/"><Button variant="gold" className="mt-6">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 pb-28">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {step === 0 ? (
            <Link href="/" className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]"><ArrowLeft className="h-5 w-5 text-zinc-400" /></Link>
          ) : (
            <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06]"><ArrowLeft className="h-5 w-5 text-zinc-400" /></button>
          )}
          <div>
            <h1 className="text-lg font-bold text-white">Get Started with Coach {config.coach.firstName}</h1>
            <p className="text-xs text-zinc-500">Step {step + 1} of {totalSteps} · Takes 2 min</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= step ? "gradient-gold" : "bg-white/[0.06]")} />
          ))}
        </div>

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gold font-semibold uppercase tracking-wider mb-2">About You</p>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">WhatsApp Number *</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Age</label>
                <input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="25" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {["Male", "Female"].map((g) => (
                    <button key={g} type="button" onClick={() => set("gender", g)}
                      className={cn("flex-1 rounded-xl border py-3 text-sm font-medium transition-all",
                        form.gender === g ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400"
                      )}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gold font-semibold uppercase tracking-wider mb-2">Your Fitness Goal</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="75" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Height (cm)</label>
                <input type="number" value={form.height} onChange={(e) => set("height", e.target.value)} placeholder="175" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">What&apos;s your goal? *</label>
              <OptionGrid options={goals} value={form.goal} onChange={(v) => set("goal", v)} />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Training Experience</label>
              <OptionGrid options={experience} value={form.exp} onChange={(v) => set("exp", v)} />
            </div>
          </div>
        )}

        {/* Step 2: Lifestyle */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gold font-semibold uppercase tracking-wider mb-2">Lifestyle</p>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Diet Preference</label>
              <OptionGrid options={dietTypes} value={form.diet} onChange={(v) => set("diet", v)} />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Gym Access</label>
              <OptionGrid options={gymAccess} value={form.gym} onChange={(v) => set("gym", v)} />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Any injuries or medical conditions?</label>
              <input type="text" value={form.injuries} onChange={(e) => set("injuries", e.target.value)} placeholder="e.g. Lower back pain, knee issue, none" className={inputClass} />
            </div>
          </div>
        )}

        {/* Step 3: Final */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gold font-semibold uppercase tracking-wider mb-2">Almost Done</p>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">How did you find Coach {config.coach.firstName}?</label>
              <OptionGrid options={sources} value={form.source} onChange={(v) => set("source", v)} />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Anything else you&apos;d like to share?</label>
              <textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Your goals, timeline, questions..." rows={3} className={cn(inputClass, "resize-none")} />
            </div>

            {/* Summary preview */}
            <Card className="mt-4">
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-3">Your Summary</p>
              <div className="space-y-1.5 text-sm">
                <p className="text-zinc-300"><span className="text-zinc-500">Name:</span> {form.name}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Goal:</span> {form.goal}</p>
                {form.weight && <p className="text-zinc-300"><span className="text-zinc-500">Weight:</span> {form.weight} kg</p>}
                {form.exp && <p className="text-zinc-300"><span className="text-zinc-500">Experience:</span> {form.exp}</p>}
                {form.diet && <p className="text-zinc-300"><span className="text-zinc-500">Diet:</span> {form.diet}</p>}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06] safe-area-bottom">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < 3 && (
              <Button variant="gold" className="flex-1 h-12 text-base rounded-2xl" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 3 && (
              <Button variant="gold" className="flex-1 h-12 text-base rounded-2xl" onClick={handleSubmit}>
                <MessageCircle className="h-5 w-5" /> Send via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
