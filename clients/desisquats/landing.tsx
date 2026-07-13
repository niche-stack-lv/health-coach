"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight, MessageCircle, Play, Star, X } from "lucide-react";

const VSL_YOUTUBE_ID = "W8JpjRWMR1w";

// ─── Testimonials carousel ──────────────────────────────────────────────
// Native horizontal scroll with snap points — no library, works with touch
// swipe, mouse-wheel, arrow keys, and the arrow buttons below.
// Poster images (thumbnails) are shown before the video loads. Safari
// often shows a black frame with `preload="metadata"`, so an explicit
// poster keeps the card looking right there too.
const THUMB_BASE = "/clients/desisquats/testimonial-thumbs";
const TESTIMONIALS = [
  { name: "Kalyan",    location: "Dallas",  result: "Lost 50+ lbs in 7 months",           video: "https://desisquats.com/wp-content/uploads/2025/09/Kalyan-Ds-Testimonial.mp4",    poster: `${THUMB_BASE}/Kalyan.webp` },
  { name: "Alekhya",   location: "",        result: "Transformed while working full-time", video: "https://desisquats.com/wp-content/uploads/2025/09/Alekhya-Ds-Testimonial.mp4",   poster: `${THUMB_BASE}/Alekhya.webp` },
  { name: "Hari",      location: "Atlanta", result: "Lost 24 lbs in 4 months",             video: "https://desisquats.com/wp-content/uploads/2025/09/Hari-Ds-Testimonial.mp4",      poster: `${THUMB_BASE}/Hari.webp` },
  { name: "Indu",      location: "",        result: "Never felt this strong before",       video: "https://desisquats.com/wp-content/uploads/2025/09/Indu-Ds-Testimonial.mp4",      poster: `${THUMB_BASE}/Indu.webp` },
  { name: "Neeti",     location: "",        result: "No more guilt about rice",            video: "https://desisquats.com/wp-content/uploads/2025/09/Neeti-Ds-Testimonial.mp4",     poster: `${THUMB_BASE}/Neeti.webp` },
  { name: "Anil",      location: "",        result: "Consistency finally clicked",         video: "https://desisquats.com/wp-content/uploads/2025/09/Anil-Ds-Testimonial.mp4",      poster: `${THUMB_BASE}/Anil.webp` },
  { name: "Santosh",   location: "",        result: "Fitness that fits corporate life",    video: "https://desisquats.com/wp-content/uploads/2025/09/Santosh-Ds-Testimonial.mp4",   poster: `${THUMB_BASE}/Santosh.webp` },
  { name: "Subhaajit", location: "",        result: "Traveled and still stayed on track",  video: "https://desisquats.com/wp-content/uploads/2025/09/Subhaajit-Ds-Testimonial.mp4", poster: `${THUMB_BASE}/Subhaajit.webp` },
];

function TestimonialsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll by one card width in either direction.
  function scrollByCards(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-slide]");
    const step = first ? first.offsetWidth + 20 /* gap */ : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-5 sm:-mx-8 px-5 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            data-slide
            className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[30%] bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col"
          >
            <video
              src={t.video}
              poster={t.poster || undefined}
              controls
              preload="metadata"
              playsInline
              className="w-full aspect-[9/16] bg-black object-cover"
            >
              Your browser does not support HTML5 video.
            </video>
            <div className="p-4">
              <div className="flex items-center gap-1 mb-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-[#f61] text-[#f61]" />)}
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-bold text-white">{t.name}</h3>
                {t.location && <span className="text-[10px] uppercase tracking-wider text-zinc-500">· {t.location}</span>}
              </div>
              <p className="text-[#f61] text-xs font-semibold mt-0.5">{t.result}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows (desktop mostly) */}
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        aria-label="Previous testimonials"
        className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-black/80 border border-white/[0.1] text-white hover:bg-black hover:border-white/[0.2] transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCards(1)}
        aria-label="Next testimonials"
        className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-black/80 border border-white/[0.1] text-white hover:bg-black hover:border-white/[0.2] transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function DesisquatsLanding() {
  const [videoOpen, setVideoOpen] = useState(false);

  // Close the VSL modal on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoOpen(false); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [videoOpen]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,10,0.92)] backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-[72px]">
          <Link href="/" className="shrink-0">
            <Image src="/clients/desisquats/logo.png" alt="DesiSquats" width={140} height={40} className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">ABOUT</a>
            <a href="#system" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">SYSTEM</a>
            <a href="#programs" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">PROGRAMS</a>
            <a href="#results" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">RESULTS</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">
              LOGIN
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-[72px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f61]/[0.03] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-0">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8">
              <div className="h-2 w-2 rounded-full bg-[#f61] animate-pulse" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Built by an NRI. Designed for NRI Professionals.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
              <span className="block text-white">FINALLY, A FITNESS SYSTEM</span>
              <span className="block text-white">THAT UNDERSTANDS YOUR</span>
              <span className="block text-[#f61] mt-2">LIFE IN AMERICA.</span>
            </h1>

            <p className="mt-8 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md">
              Become healthier, stronger, and more confident — without giving up Indian food, family dinners, travel, or the life you have built here.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/checkout"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_8px_40px_rgba(255,102,17,0.4)]"
              >
                I WANT TO TRANSFORM NOW
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#results"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg transition-all hover:bg-white/[0.03]"
              >
                <Play className="h-4 w-4" />
                SEE TRANSFORMATIONS
              </a>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="group relative block w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50 focus:outline-none focus:ring-2 focus:ring-[#f61]/60"
              aria-label="Play video: A message from Coach Praneeth"
            >
              <img
                src="/clients/desisquats/coach.webp"
                alt="Coach Praneeth"
                className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Dark overlay for contrast against the play button */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-black/25 to-black/25 group-hover:from-[#0a0a0a]/60 transition-colors" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-[#f61]/50 blur-xl animate-pulse" aria-hidden />
                  <span className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f61] to-[#e55a00] shadow-[0_10px_40px_rgba(255,102,17,0.55)] transition-transform group-hover:scale-110">
                    <Play className="h-9 w-9 sm:h-10 sm:w-10 text-white translate-x-[2px] fill-white" aria-hidden />
                  </span>
                </span>
              </div>
              {/* Caption on the image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.2em]">Watch Praneeth&apos;s Message</span>
                <span className="text-[10px] font-semibold text-white/70">2 min</span>
              </div>
            </button>
            <div className="absolute -bottom-4 -left-4 bg-[#f61] text-white px-5 py-3 rounded-xl shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider">Coach Praneeth</p>
              <p className="text-[10px] text-white/70 mt-0.5">Founder • ACE Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — TRUST BAR
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { stat: "550+", label: "Indian Professionals Coached" },
            { stat: "10,000+", label: "Pounds Lost" },
            { stat: "16+", label: "Years Living the NRI Lifestyle" },
            { stat: "ACE Certified", label: "Coach" },
          ].map((t) => (
            <div key={t.label}>
              <p className="text-lg sm:text-xl font-extrabold text-[#f61] leading-tight">{t.stat}</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — MEET PRANEETH
          ═══════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
              <img
                src="/clients/desisquats/hero-bg.webp"
                alt="Client transformations"
                className="w-full h-auto object-contain bg-black"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-gradient-to-br from-[#f61] to-[#e55a00] text-white px-6 py-4 rounded-2xl shadow-xl">
              <p className="text-3xl font-extrabold">550+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Clients Coached</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">FOUNDER • DESISQUATS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight mb-6">
              MEET PRANEETH
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              I built DesiSquats because I have lived the same life. I moved to America 16+ years ago, built a corporate career in semiconductors up to Senior Technical Manager, became a husband and father, and understand the reality of balancing Indian food, work, family, travel, and health in the U.S.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              After coaching 550+ Indian professionals, I realized people do not need more fitness information. They need a system that works in real life.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "16+ years living the NRI lifestyle in America",
                "Senior Technical Manager in semiconductors, turned coach",
                "Coached 550+ Indian professionals",
                "Built The DesiSquats System™ from lived experience — not theory",
              ].map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#f61]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[#f61]" />
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] text-white text-sm font-bold uppercase tracking-wider px-7 py-4 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_4px_30px_rgba(255,102,17,0.5)]"
            >
              I WANT TO TRANSFORM NOW
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — THE REAL PROBLEM
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080808] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f61]/[0.02] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">THE REAL PROBLEM</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
            YOUR LIFESTYLE IS NOT THE PROBLEM.<br /><span className="text-[#f61]">YOUR STRATEGY IS.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Long workdays", "Indian food", "Travel", "Weekends", "Family dinners", "Stress", "Kids"].map((item) => (
              <span key={item} className="text-sm text-zinc-300 border border-white/[0.08] bg-[#111] rounded-full px-4 py-2">{item}</span>
            ))}
          </div>
          <p className="mt-8 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            None of these are the problem. The problem is trying to follow a fitness plan that was never built for your life.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — THE DESISQUATS SYSTEM™
          ═══════════════════════════════════════════════════════════════ */}
      <section id="system" className="py-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">THE SYSTEM</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            THE DESISQUATS SYSTEM™
          </h2>
          <p className="mt-4 text-sm text-zinc-500 max-w-lg mx-auto">
            A fitness system built around Indian food, American life, and real-life decision support.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { title: "PERSONALIZED STRATEGY", desc: "A plan built around your body, goals, and lifestyle." },
              { title: "DESISQUATS DASHBOARD", desc: "Track everything that matters in one place." },
              { title: "MINDSET & STRATEGY LIBRARY", desc: "Learn the reasoning behind every decision." },
              { title: "REAL-LIFE DECISION SUPPORT", desc: "Guidance for restaurants, travel, and busy weeks." },
              { title: "SUSTAINABLE HABITS", desc: "Systems that keep you consistent for the long run." },
            ].map((step, i) => (
              <div key={step.title} className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 hover:border-[#f61]/20 transition-colors">
                <span className="text-4xl font-extrabold text-[#f61]">{i + 1}</span>
                <h3 className="text-sm font-bold text-white mt-3 tracking-wide">{step.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — REAL-LIFE DECISION SUPPORT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">WHAT MAKES US DIFFERENT</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              REAL-LIFE DECISION SUPPORT
            </h2>
            <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto">
              Fitness is built by thousands of good decisions — not one perfect one. DesiSquats helps you make better decisions during:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Indian restaurants",
              "Travel",
              "Weekends",
              "Weddings",
              "Parents visiting",
              "Stressful work weeks",
              "Cravings",
              "Missed workouts",
            ].map((q) => (
              <div key={q} className="flex items-start gap-3 bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3">
                <Check className="h-4 w-4 text-[#f61] shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — CHOOSE YOUR JOURNEY (PROGRAMS)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="programs" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">CHOOSE YOUR PATH</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              CHOOSE YOUR JOURNEY
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* THE GUIDED JOURNEY */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 hover:border-[#f61]/30 transition-all">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">THE GUIDED JOURNEY</span>
              </div>
              <p className="text-3xl font-extrabold text-white">
                <span className="text-lg font-normal text-zinc-600 line-through mr-2">$499</span>$399
                <span className="text-base font-normal text-zinc-500"> / 100 days</span>
              </p>
              <p className="text-sm text-zinc-400 mt-3 mb-6">For self-motivated professionals who want the right system.</p>
              <div className="space-y-3">
                {["Personalized Nutrition Strategy", "Customized Workout Plan", "DesiSquats Dashboard", "Progress Tracking", "Grocery & Restaurant Guides", "Indian Food Swaps", "Mindset & Strategy Library", "WhatsApp Community", "Weekend Group Coaching"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/checkout" className="block mt-8">
                <button className="w-full bg-white/[0.06] border border-white/[0.1] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-white/[0.1] transition-colors">
                  I WANT TO TRANSFORM NOW
                </button>
              </Link>
            </div>

            {/* THE COACH-LED JOURNEY */}
            <div className="bg-[#111] border-2 border-[#f61]/40 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f61] to-[#e55a00]" />
              <div className="inline-flex items-center gap-2 bg-[#f61]/10 border border-[#f61]/20 rounded-full px-3 py-1 mb-4">
                <span className="text-[11px] font-bold text-[#f61] uppercase tracking-wider">THE COACH-LED JOURNEY</span>
              </div>
              <p className="text-3xl font-extrabold text-white">
                <span className="text-lg font-normal text-zinc-600 line-through mr-2">$1,199</span>$999
                <span className="text-base font-normal text-zinc-500"> / 100 days</span>
              </p>
              <p className="text-sm text-zinc-400 mt-3 mb-6">For professionals who want Praneeth personally guiding them.</p>
              <div className="space-y-3">
                {["Weekly 1-on-1 Coaching", "Daily WhatsApp Real-Life Decision Support", "Direct Access to Coach Praneeth", "Weekly Adjustments", "Travel & Restaurant Planning", "Plateau Troubleshooting", "Priority Support"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#f61] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-4 italic">You don&apos;t just get a plan. You get direct coaching.</p>
              <Link href="/checkout" className="block mt-6">
                <button className="w-full bg-gradient-to-r from-[#f61] to-[#e55a00] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-lg shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_4px_30px_rgba(255,102,17,0.5)] transition-all">
                  I WANT TO TRANSFORM NOW
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8 — RESULTS
          ═══════════════════════════════════════════════════════════════ */}
      <section id="results" className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">CLIENT RESULTS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
              REAL TRANSFORMATIONS.<br /><span className="text-[#f61]">REAL STORIES. REAL LIFE.</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-4 max-w-lg mx-auto">Because every transformation started with someone who believed they were &ldquo;too busy.&rdquo;</p>
          </div>
          <TestimonialsCarousel />
          <p className="mt-4 text-center text-[11px] text-zinc-600 uppercase tracking-wider">Swipe to see more →</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 9 — FINAL CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/clients/desisquats/hero-bg.webp" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-[0.95]">
            THE BEST VERSION OF YOU<br /><span className="text-[#f61]">HAS BEEN THERE ALL ALONG.</span>
          </h2>
          <p className="mt-6 text-base text-zinc-400 leading-relaxed max-w-lg mx-auto">
            You do not need to give up Indian food or wait for life to become less busy. You need a fitness strategy that finally matches the life you have built in America.
          </p>
          <Link
            href="/checkout"
            className="group inline-flex items-center gap-2 mt-10 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-base font-bold uppercase tracking-wider px-10 py-5 rounded-lg transition-all shadow-[0_4px_30px_rgba(255,102,17,0.4)] hover:shadow-[0_8px_50px_rgba(255,102,17,0.5)]"
          >
            I WANT TO TRANSFORM NOW
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Image src="/clients/desisquats/footer-logo.png" alt="DesiSquats" width={120} height={36} className="h-7 w-auto" />
          <div className="flex items-center gap-6 text-[12px] text-zinc-500">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#system" className="hover:text-white transition-colors">System</a>
            <a href="#programs" className="hover:text-white transition-colors">Programs</a>
            <a href="#results" className="hover:text-white transition-colors">Results</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="https://www.instagram.com/desisquats" target="_blank" rel="noopener noreferrer" className="hover:text-[#f61] transition-colors">Instagram</a>
          </div>
        </div>
        <p className="text-center text-[10px] text-zinc-700 mt-6 uppercase tracking-wider">
          © {new Date().getFullYear()} DesiSquats. All rights reserved.
        </p>
      </footer>

      {/* Sticky bottom CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[rgba(10,10,10,0.92)] backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-8 py-3">
          <div className="hidden sm:block min-w-0">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-wider">Limited spots</p>
            <p className="text-xs text-zinc-400 truncate">100-day transformation for NRI professionals</p>
          </div>
          <Link
            href="/checkout"
            className="group inline-flex flex-1 sm:flex-none items-center justify-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.35)]"
          >
            I WANT TO TRANSFORM
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Floating WhatsApp — lifted above the sticky CTA */}
      <a
        href="https://wa.me/19712706678"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)_+_5rem)] right-4 z-50 h-12 w-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 text-white" />
      </a>

      {/* ═══════════════════════════════════════════════════════════════
          VSL MODAL — plays the coach's video sales letter
          ═══════════════════════════════════════════════════════════════ */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center px-4 sm:px-8 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Coach Praneeth video"
          onClick={() => setVideoOpen(false)}
        >
          <button
            type="button"
            onClick={() => setVideoOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
            aria-label="Close video"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div
            className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${VSL_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Coach Praneeth — A Message"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
