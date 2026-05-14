"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dumbbell,
  ArrowLeft,
  Check,
  Copy,
  Upload,
  Crown,
  Zap,
  Download,
  ChevronRight,
} from "lucide-react";
import { generateConfirmationPDF } from "@/lib/confirmation-pdf";
import { saveLead } from "@/lib/db";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { config, formatPrice } from "@/lib/config";

const UPI_ID = config.contact.upiId;
const pricingConfig = config.pricing as any;
const programsConfig = config.programs as any[];

const programs = (programsConfig || []).map((p: any) => ({ name: p.name, emoji: p.emoji }));

const durations = pricingConfig?.durations || [];

const oneTimeSubs = [
  { id: "diet", label: "Diet Plan" },
  { id: "workout", label: "Workout Plan" },
  { id: "supplementation", label: "Supplementation Plan" },
  { id: "all", label: "All 3 — Best Value" },
];

const oneTimeSinglePrice = pricingConfig?.oneTimeSingle || {};
const oneTimeAllPrice = pricingConfig?.oneTimeAll || {};
const goldPrice = pricingConfig?.gold || {};
const platinumPrice = pricingConfig?.platinum || {};

type PlanType = "one-time" | "gold" | "platinum" | null;
type Duration = "4" | "8" | "12";

const inputClass = "w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3.5 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all";

export default function PricingPage() {
  const [program, setProgram] = useState("");
  const [duration, setDuration] = useState<Duration>("8");
  const [planType, setPlanType] = useState<PlanType>(null);
  const [oneTimeSub, setOneTimeSub] = useState("");
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [diet, setDiet] = useState("");
  const [gym, setGym] = useState("");
  const [injuries, setInjuries] = useState("");
  const [experience, setExperience] = useState("");

  const getPrice = () => {
    if (planType === "gold") return goldPrice[duration];
    if (planType === "platinum") return platinumPrice[duration];
    if (planType === "one-time") {
      if (oneTimeSub === "all") return oneTimeAllPrice[duration];
      if (oneTimeSub) return oneTimeSinglePrice[duration];
    }
    return 0;
  };

  const isSelectionComplete = program && duration && planType && (planType === "gold" || planType === "platinum" || oneTimeSub);
  const price = getPrice();
  const WHATSAPP_NUMBER = config.contact.whatsappNumber;

  const copyUPI = () => { navigator.clipboard.writeText(UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const getPlanLabel = () => {
    if (planType === "gold") return "Customized Gold";
    if (planType === "platinum") return "Customized Platinum";
    if (oneTimeSub === "all") return "Diet + Workout + Supplementation";
    return oneTimeSubs.find((s) => s.id === oneTimeSub)?.label || "";
  };

  const generatePDF = () => {
    generateConfirmationPDF({ name, phone, email, program, duration, planLabel: getPlanLabel(), price: `₹${price.toLocaleString("en-IN")}`, type: "plan" }).catch(console.error);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    // Save lead to Supabase
    await saveLead({
      source: "pricing",
      name, email, phone,
      goal: program,
      program,
      plan_type: planType || undefined,
      plan_label: getPlanLabel(),
      price: `₹${price.toLocaleString("en-IN")}`,
      duration,
      age, gender, weight, height,
      diet, gym,
      experience,
      injuries,
    });
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setDone(true);
    const planLabel = getPlanLabel();
    const msg = [
      `🏋️ *New ${config.brand.name} Order*`, ``,
      `*Client:* ${name}`, `*Phone:* ${phone}`, `*Email:* ${email}`,
      age ? `*Age:* ${age}` : "", gender ? `*Gender:* ${gender}` : "",
      weight ? `*Weight:* ${weight} kg` : "", height ? `*Height:* ${height} cm` : "", ``,
      `*Program:* ${program}`, `*Duration:* ${duration} Weeks`,
      `*Plan:* ${planLabel}`, `*Amount:* ₹${price.toLocaleString("en-IN")}`, ``,
      diet ? `*Diet:* ${diet}` : "", gym ? `*Gym:* ${gym}` : "",
      experience ? `*Experience:* ${experience}` : "", injuries ? `*Injuries:* ${injuries}` : "", ``,
      `Payment screenshot uploaded. Please verify and activate.`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── DONE STATE ──
  if (done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-6 mx-auto ring-1 ring-gold/20">
            <Check className="h-9 w-9 text-gold" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">You&apos;re In</h1>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            Coach {config.coach.firstName} will verify your payment and activate your account within 24 hours.
          </p>
          <button onClick={generatePDF}
            className="mt-8 inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-zinc-300 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-white/[0.08] transition-colors rounded-2xl">
            <Download className="h-3.5 w-3.5" /> Download Confirmation
          </button>
          <div className="mt-4">
            <Link href="/"><button className="bg-gold text-black px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-colors rounded-2xl">Back to Home</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-4">
          <Link href="/" className="p-1.5 -ml-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
            <ArrowLeft className="h-5 w-5 text-zinc-500" />
          </Link>
          <div className="flex-1">
            <p className="text-sm font-bold text-white tracking-tight">Start Your Transformation</p>
          </div>
          <div className="text-[9px] text-gold font-bold uppercase tracking-wider animate-pulse">{config.brand.pricingBadge}</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 pb-32">

        {/* ═══ STEP 1: GOAL ═══ */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold ring-1 ring-gold/20">1</div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold">What&apos;s Your Goal</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {programs.map((p) => (
              <button key={p.name} onClick={() => setProgram(p.name)}
                className={cn("rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98]",
                  program === p.name
                    ? "border-gold/50 bg-gradient-to-br from-gold/10 to-transparent"
                    : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                )}>
                <span className="text-lg">{p.emoji}</span>
                <p className={cn("text-xs font-semibold mt-1.5", program === p.name ? "text-gold" : "text-zinc-300")}>{p.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ STEP 2: DURATION ═══ */}
        {program && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold ring-1 ring-gold/20">2</div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold">Duration</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {durations.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={cn("rounded-2xl border py-5 text-center transition-all active:scale-[0.98]",
                    duration === d
                      ? "border-gold/50 bg-gradient-to-b from-gold/10 to-transparent"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  )}>
                  <p className={cn("text-2xl font-black", duration === d ? "text-gold" : "text-white")}>{d}</p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1">Weeks</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 3: PLAN TYPE ═══ */}
        {program && duration && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold ring-1 ring-gold/20">3</div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold">Choose Your Plan</p>
            </div>
            <div className="space-y-3">

              {/* One-Time */}
              <button onClick={() => { setPlanType("one-time"); setOneTimeSub(""); }}
                className={cn("w-full rounded-2xl border px-5 py-5 text-left transition-all active:scale-[0.99]",
                  planType === "one-time" ? "border-zinc-500/50 bg-white/[0.03]" : "border-white/[0.06] hover:border-white/[0.12]"
                )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-gold" />
                    <p className="text-sm font-bold text-gold">One-Time Plan</p>
                  </div>
                  <p className="text-xs text-zinc-500 font-semibold">from ₹{oneTimeSinglePrice[duration].toLocaleString("en-IN")}</p>
                </div>
                <div className="ml-6.5 space-y-1.5">
                  {["Plan delivered once — diet, workout, or supplementation", `No direct chat with Coach ${config.coach.firstName}`, "No weekly check-ins"].map((t) => (
                    <p key={t} className="text-[11px] text-zinc-500 flex items-start gap-2"><span className="text-zinc-700 mt-0.5">·</span>{t}</p>
                  ))}
                </div>
              </button>

              {/* Gold */}
              <button onClick={() => { setPlanType("gold"); setOneTimeSub(""); }}
                className={cn("w-full rounded-2xl border-2 px-5 py-5 text-left transition-all active:scale-[0.99] relative",
                  planType === "gold"
                    ? "border-amber-400/60 bg-gradient-to-br from-amber-500/10 via-amber-900/5 to-transparent shadow-[0_0_30px_rgba(245,158,11,0.08)]"
                    : "border-amber-500/15 hover:border-amber-500/30 bg-gradient-to-br from-amber-500/[0.03] to-transparent"
                )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <p className="text-sm font-bold text-gold">Customized Gold</p>
                  </div>
                  <p className="text-xs text-amber-400/70 font-bold">₹{goldPrice[duration].toLocaleString("en-IN")}</p>
                </div>
                <div className="ml-6.5 space-y-1.5">
                  {["Custom diet + workout + supplement plan", "Weekly check-ins & plan adjustments", `App-based communication with Coach ${config.coach.firstName}`, "Progress tracking on the app"].map((t) => (
                    <p key={t} className="text-[11px] text-zinc-400 flex items-start gap-2"><span className="text-amber-500/40 mt-0.5">·</span>{t}</p>
                  ))}
                </div>
              </button>

              {/* Platinum */}
              <button onClick={() => { setPlanType("platinum"); setOneTimeSub(""); }}
                className={cn("w-full rounded-2xl border-2 px-5 py-5 text-left transition-all active:scale-[0.99] relative",
                  planType === "platinum"
                    ? "border-slate-300/50 bg-gradient-to-br from-slate-300/10 via-slate-500/5 to-transparent shadow-[0_0_30px_rgba(203,213,225,0.08)]"
                    : "border-slate-400/15 hover:border-slate-400/30 bg-gradient-to-br from-slate-400/[0.03] to-transparent"
                )}>
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-slate-200 to-slate-400 text-black px-3 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full">Recommended</div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-slate-300" />
                    <p className="text-sm font-bold text-gold">Customized Platinum</p>
                  </div>
                  <p className="text-xs text-slate-300/70 font-bold">₹{platinumPrice[duration].toLocaleString("en-IN")}</p>
                </div>
                <div className="ml-6.5 space-y-1.5">
                  {["Everything in Gold, plus:", "WhatsApp query support throughout", `Once a week video call with Coach ${config.coach.firstName}`, "Detailed progress reviews & form checks"].map((t, i) => (
                    <p key={t} className={cn("text-[11px] flex items-start gap-2", i === 0 ? "text-slate-400 font-medium" : "text-zinc-400")}><span className="text-slate-400/40 mt-0.5">·</span>{t}</p>
                  ))}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3b: ONE-TIME SUB ═══ */}
        {planType === "one-time" && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-4 ml-8">Choose what you need</p>
            <div className="space-y-2">
              {oneTimeSubs.map((s) => {
                const isAll = s.id === "all";
                const subPrice = isAll ? oneTimeAllPrice[duration] : oneTimeSinglePrice[duration];
                return (
                  <button key={s.id} onClick={() => setOneTimeSub(s.id)}
                    className={cn("w-full rounded-2xl border px-5 py-3.5 text-left transition-all active:scale-[0.99] flex items-center justify-between",
                      oneTimeSub === s.id ? "border-gold/40 bg-gold/5" : "border-white/[0.06] hover:border-white/[0.12]"
                    )}>
                    <div className="flex items-center gap-3">
                      <div className={cn("h-5 w-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                        oneTimeSub === s.id ? "bg-gold border-gold text-black" : "border-white/[0.12]"
                      )}>{oneTimeSub === s.id && <Check className="h-3 w-3" />}</div>
                      <span className={cn("text-sm font-medium", oneTimeSub === s.id ? "text-gold" : "text-zinc-300", isAll && "font-bold")}>{s.label}</span>
                    </div>
                    <span className={cn("text-sm font-bold tabular-nums", oneTimeSub === s.id ? "text-gold" : "text-zinc-600")}>₹{subPrice.toLocaleString("en-IN")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 4: ABOUT YOU ═══ */}
        {isSelectionComplete && !showPayment && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold ring-1 ring-gold/20">4</div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold">Tell Us About Yourself</p>
            </div>

            <div className="space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Gender</label>
                  <div className="flex gap-2">
                    {["Male", "Female"].map((g) => (
                      <button key={g} type="button" onClick={() => setGender(g)}
                        className={cn("flex-1 rounded-2xl border py-3 text-xs font-medium transition-all",
                          gender === g ? "border-gold/40 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                        )}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Weight (kg)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Height (cm)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-2 font-medium">Diet Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Non-Vegetarian", "Vegetarian", "Eggetarian", "Vegan"].map((d) => (
                    <button key={d} type="button" onClick={() => setDiet(d)}
                      className={cn("rounded-2xl border px-3 py-2.5 text-[11px] font-medium transition-all",
                        diet === d ? "border-gold/40 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                      )}>{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-2 font-medium">Gym Access</label>
                <div className="space-y-2">
                  {["Yes, I go to a gym", "Home workouts only", "I have a home gym"].map((g) => (
                    <button key={g} type="button" onClick={() => setGym(g)}
                      className={cn("w-full rounded-2xl border px-4 py-2.5 text-[11px] text-left font-medium transition-all",
                        gym === g ? "border-gold/40 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                      )}>{g}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-2 font-medium">Experience</label>
                <div className="space-y-2">
                  {["Beginner (< 1 year)", "Intermediate (1-3 years)", "Advanced (3+ years)"].map((e) => (
                    <button key={e} type="button" onClick={() => setExperience(e)}
                      className={cn("w-full rounded-2xl border px-4 py-2.5 text-[11px] text-left font-medium transition-all",
                        experience === e ? "border-gold/40 bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                      )}>{e}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Injuries / Medical Conditions</label>
                <input type="text" value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="e.g. Lower back pain, knee issue, none" className={inputClass} />
              </div>
            </div>

            {/* Price card */}
            <div className="mt-8 rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-transparent p-6 text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60 font-semibold">Your Plan</p>
              <p className="text-sm text-zinc-300 font-medium mt-2">{program} · {duration} Weeks</p>
              <p className="text-xs text-zinc-500 mt-0.5">{getPlanLabel()}</p>
              <p className="text-5xl font-black text-gradient-gold mt-4">₹{price.toLocaleString("en-IN")}</p>
              <p className="text-[9px] text-zinc-600 mt-2 uppercase tracking-wider">One-time payment · No hidden fees</p>
            </div>

            <button onClick={() => setShowPayment(true)}
              className="w-full mt-5 bg-gold text-black py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all rounded-2xl shadow-[0_0_30px_rgba(212,168,83,0.15)] flex items-center justify-center gap-2">
              Proceed to Payment <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ═══ PAYMENT ═══ */}
        {showPayment && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-6">
            <button onClick={() => setShowPayment(false)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-gold transition-colors font-medium">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to plan details
            </button>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">{program} · {duration}W</p>
                <p className="text-[10px] text-zinc-600">{getPlanLabel()}</p>
              </div>
              <p className="text-2xl font-black text-gold">₹{price.toLocaleString("en-IN")}</p>
            </div>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 font-semibold mb-5">Scan QR to Pay</p>
              <div className="inline-block bg-white p-3 rounded-xl">
                <Image src={config.images.upiQr} alt="UPI QR" width={180} height={180} />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <code className="text-xs text-gold font-mono bg-gold/5 border border-gold/15 px-3 py-1.5 rounded-xl">{UPI_ID}</code>
                <button onClick={copyUPI} className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5 text-zinc-600" />}
                </button>
              </div>
              <div className="mt-5 space-y-1 text-[11px] text-zinc-600">
                <p>Open GPay / PhonePe → Scan QR → Pay ₹{price.toLocaleString("en-IN")} → Screenshot</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium mb-3">Upload Screenshot</p>
              <label className={cn("flex flex-col items-center justify-center border border-dashed rounded-2xl p-8 cursor-pointer transition-all",
                screenshot ? "border-gold/40 bg-gold/5" : "border-white/[0.08] hover:border-white/[0.15]"
              )}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
                {screenshot ? (<><Check className="h-5 w-5 text-gold mb-1.5" /><p className="text-[11px] text-gold font-medium">{screenshot.name}</p></>) : (<><Upload className="h-5 w-5 text-zinc-600 mb-1.5" /><p className="text-[11px] text-zinc-600">Tap to upload</p></>)}
              </label>
            </div>

            <div className="space-y-3">
              <div><label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">WhatsApp Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 font-medium">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputClass} /></div>
            </div>

            <button onClick={handleConfirm} disabled={!screenshot || !name || !phone || !email || submitting}
              className="w-full bg-gold text-black py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all disabled:opacity-40 rounded-2xl">
              {submitting ? "Submitting..." : "Confirm Payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
