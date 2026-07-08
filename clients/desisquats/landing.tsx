"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MessageCircle, Play, Star } from "lucide-react";

export default function DesisquatsLanding() {
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
            <Link href="/login" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors hidden sm:block">
              LOGIN
            </Link>
            <Link
              href="/enquiry"
              className="bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_4px_30px_rgba(255,102,17,0.5)]"
            >
              I WANT TO TRANSFORM NOW
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
                href="/enquiry"
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
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
              <img
                src="/clients/desisquats/coach.webp"
                alt="Coach Praneeth"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />
            </div>
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
                src="/clients/desisquats/scientific-process.webp"
                alt="Coach Praneeth training"
                className="w-full aspect-square object-cover"
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
              href="/enquiry"
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
              <Link href="/enquiry" className="block mt-8">
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
              <Link href="/enquiry" className="block mt-6">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Kalyan", location: "Dallas", result: "Lost 50+ lbs in 7 months while still eating Indian food", quote: "The process was simple. I could still have my chai and parathas while losing weight.", img: "/clients/desisquats/kalyan.webp" },
              { name: "Alekhya", location: "", result: "Transformed her body while balancing work and family life", quote: "Praneeth built a plan around my real life. I stopped restarting and finally saw the scale move for good.", img: "/clients/desisquats/alekhya.webp" },
              { name: "Hari", location: "Atlanta", result: "Lost 24 lbs in 4 months while balancing corporate life", quote: "Strength training changed my life. I feel more energetic at work than ever before.", img: "/clients/desisquats/hari.webp" },
            ].map((t) => (
              <div key={t.name} className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors">
                <div className="overflow-hidden">
                  <img src={t.img} alt={t.name} className="w-full h-auto object-contain" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#f61] text-[#f61]" />)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-white">{t.name}</h3>
                    {t.location && <span className="text-[10px] uppercase tracking-wider text-zinc-500">· {t.location}</span>}
                  </div>
                  <p className="text-[#f61] text-sm font-semibold mt-0.5">{t.result}</p>
                  <p className="text-zinc-400 text-sm italic mt-3 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
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
            href="/enquiry"
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
            href="/enquiry"
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
    </div>
  );
}
