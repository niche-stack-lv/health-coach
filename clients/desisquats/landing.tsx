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
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image src="/clients/desisquats/logo.png" alt="DesiSquats" width={140} height={40} className="h-8 w-auto" />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#programs" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">PROGRAMS</a>
            <a href="#results" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">RESULTS</a>
            <a href="#about" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">ABOUT</a>
            <a href="#process" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors">PROCESS</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-semibold text-zinc-400 hover:text-white tracking-wide transition-colors hidden sm:block">
              LOGIN
            </Link>
            <Link
              href="/enquiry"
              className="bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_4px_30px_rgba(255,102,17,0.5)]"
            >
              APPLY NOW
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Premium split layout
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-[72px]">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f61]/[0.03] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-0">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8">
              <div className="h-2 w-2 rounded-full bg-[#f61] animate-pulse" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Built by an NRI • Designed for NRI professionals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
              <span className="block text-white">FINALLY — A FITNESS SYSTEM</span>
              <span className="block text-white">THAT UNDERSTANDS YOUR</span>
              <span className="block text-[#f61] mt-2">LIFE IN AMERICA.</span>
            </h1>

            <p className="mt-8 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md">
              Become the healthiest, strongest, and most confident version of yourself — without giving up Indian food, family dinners, travel, or the life you&apos;ve built in the U.S.
            </p>

            <p className="mt-6 text-sm text-zinc-500 italic">
              Unlike generic fitness programs, DesiSquats is built around the realities of first-generation Indian professionals living in America.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/enquiry"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_8px_40px_rgba(255,102,17,0.4)]"
              >
                START YOUR JOURNEY
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#results"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg transition-all hover:bg-white/[0.03]"
              >
                <Play className="h-4 w-4" />
                SEE REAL TRANSFORMATIONS
              </a>
            </div>

            {/* Social proof strip */}
            <div className="mt-12 flex items-center gap-6 border-t border-white/[0.06] pt-6">
              <div>
                <p className="text-2xl font-bold text-white">550+</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Professionals Coached</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <p className="text-2xl font-bold text-white">16+</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Years the NRI Life</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <p className="text-2xl font-bold text-white">10,000+</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Pounds Lost</p>
              </div>
            </div>
          </div>

          {/* Right — Coach image */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
              <img
                src="/clients/desisquats/coach.webp"
                alt="Coach Praneeth"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-[#f61] text-white px-5 py-3 rounded-xl shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider">Coach Praneeth</p>
              <p className="text-[10px] text-white/70 mt-0.5">PhD | NRI Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRUST BAR
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {[
            { stat: "550+", label: "Indian Professionals Coached" },
            { stat: "16+", label: "Years Living the NRI Lifestyle" },
            { stat: "10,000+", label: "Pounds Lost by Clients" },
            { stat: "Indian Food", label: "+ American Life, By Design" },
            { stat: "ACE Certified", label: "Founder-Led Coaching" },
          ].map((t) => (
            <div key={t.label}>
              <p className="text-lg sm:text-xl font-extrabold text-[#f61] leading-tight">{t.stat}</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE REAL PROBLEM
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f61]/[0.02] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">THE REAL PROBLEM</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
            YOUR LIFESTYLE ISN&apos;T THE PROBLEM.<br /><span className="text-[#f61]">YOUR STRATEGY IS.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Long meetings", "Kids", "Business travel", "Indian restaurants", "Parents visiting", "Stress eating", "Weekend parties"].map((item) => (
              <span key={item} className="text-sm text-zinc-300 border border-white/[0.08] bg-[#111] rounded-full px-4 py-2">{item}</span>
            ))}
          </div>
          <p className="mt-8 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            None of these are the problem. The problem is trying to follow a plan that was never designed for your life.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY US — Premium feature grid
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">BUILT FOR REAL LIFE</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
              YOUR LIFESTYLE DOESN&apos;T NEED TO CHANGE.<br /><span className="text-[#f61]">YOUR FITNESS STRATEGY DOES.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { emoji: "🍛", title: "Indian Food You Love", desc: "Dal, roti, rice, biryani — structured around your goals, not banned." },
              { emoji: "💼", title: "Corporate Schedule", desc: "Meal timing and prep that fits long hours and back-to-back meetings." },
              { emoji: "✈️", title: "Travel & Vacations", desc: "A strategy that survives work trips and holidays — no starting over." },
              { emoji: "👨‍👩‍👧", title: "Family Responsibilities", desc: "Built for real life with kids, parents, and family dinners." },
              { emoji: "🏆", title: "Sustainable Weight Loss", desc: "Habits that last for years, not a crash diet that lasts weeks." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/[0.12] transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-xl mx-auto mb-4">
                  {feature.emoji}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 tracking-wide">{feature.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DIFFERENTIATION — I understand your life
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">WHY MOST PROGRAMS FAIL NRIs</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight leading-tight">
              MOST COACHES UNDERSTAND INDIAN FOOD.<br />
              <span className="text-[#f61]">VERY FEW UNDERSTAND INDIAN LIFE IN AMERICA.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Traditional */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-4">Traditional Coaching</h3>
              <div className="space-y-3">
                {["Generic meal plans", "Motivation over strategy", "Restrictive dieting", "Temporary results", "Starts over after vacations"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full border border-zinc-600 shrink-0" />
                    <span className="text-sm text-zinc-500">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* DesiSquats */}
            <div className="bg-[#111] border-2 border-[#f61]/40 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f61] to-[#e55a00]" />
              <h3 className="text-sm font-bold text-[#f61] uppercase tracking-wide mb-4">DesiSquats Is</h3>
              <div className="space-y-3">
                {["Built around your lifestyle", "Indian food flexibility", "Real-life decision support", "Sustainable habits", "Long-term transformation"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#f61] shrink-0" />
                    <span className="text-sm text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE DESISQUATS SYSTEM™
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">THE SYSTEM</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            THE DESISQUATS SYSTEM™
          </h2>
          <p className="mt-4 text-sm text-zinc-500 max-w-lg mx-auto">
            A transformation system built specifically for Indian professionals living in the U.S.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "DASHBOARD", desc: "Track everything that matters in one place." },
              { title: "EDUCATION", desc: "Understand why you're making each decision." },
              { title: "STRATEGY", desc: "Nutrition built around Indian food and American life." },
              { title: "IMPLEMENTATION", desc: "Simple systems that keep you consistent." },
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
          PROGRAMS — Basic + Elite pricing
          ═══════════════════════════════════════════════════════════════ */}
      <section id="programs" className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">CHOOSE YOUR PATH</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              CHOOSE YOUR JOURNEY
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* GUIDED DASHBOARD */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 hover:border-[#f61]/30 transition-all">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">GUIDED DASHBOARD PROGRAM</span>
              </div>
              <p className="text-3xl font-extrabold text-white">
                <span className="text-lg font-normal text-zinc-600 line-through mr-2">$499</span>$399
                <span className="text-base font-normal text-zinc-500"> / 3 months</span>
              </p>
              <p className="text-sm text-zinc-400 mt-3 mb-6">Perfect for professionals who want a proven system they can follow independently.</p>
              <div className="space-y-3">
                {["Personalized Nutrition Strategy", "Customized Workout Plan", "DesiSquats Dashboard", "Progress Tracking", "Grocery & Restaurant Guides", "Indian Food Swaps", "Educational Library", "WhatsApp Community", "Weekend Group Coaching"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/enquiry" className="block mt-8">
                <button className="w-full bg-white/[0.06] border border-white/[0.1] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-white/[0.1] transition-colors">
                  START YOUR JOURNEY
                </button>
              </Link>
            </div>

            {/* ELITE */}
            <div className="bg-[#111] border-2 border-[#f61]/40 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f61] to-[#e55a00]" />
              <div className="inline-flex items-center gap-2 bg-[#f61]/10 border border-[#f61]/20 rounded-full px-3 py-1 mb-4">
                <span className="text-[11px] font-bold text-[#f61] uppercase tracking-wider">ELITE 1-ON-1 COACHING</span>
              </div>
              <p className="text-3xl font-extrabold text-white">
                <span className="text-lg font-normal text-zinc-600 line-through mr-2">$1,199</span>$999
                <span className="text-base font-normal text-zinc-500"> / 3 months</span>
              </p>
              <p className="text-sm text-zinc-400 mt-3 mb-6">Everything in the Guided Dashboard Program, plus direct 1-on-1 coaching.</p>
              <div className="space-y-3">
                {["Weekly 1-on-1 Coaching", "Daily WhatsApp Accountability", "Direct Access to Coach Praneeth", "Weekly Adjustments", "Travel & Restaurant Planning", "Plateau Troubleshooting", "Priority Support"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#f61] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-4 italic">You don&apos;t just get a plan. You get direct coaching.</p>
              <Link href="/enquiry" className="block mt-6">
                <button className="w-full bg-gradient-to-r from-[#f61] to-[#e55a00] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-lg shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_4px_30px_rgba(255,102,17,0.5)] transition-all">
                  START YOUR JOURNEY
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          RESULTS — Testimonials with unique images
          ═══════════════════════════════════════════════════════════════ */}
      <section id="results" className="py-24">
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
              { name: "Kalyan", result: "Lost 18 lbs in 16 weeks", quote: "The process was simple. I could still have my chai and parathas while losing weight.", img: "/clients/desisquats/kalyan.webp" },
              { name: "Neeti", result: "Lost 15 lbs in 12 weeks", quote: "Finally found a program that understands my busy life in the US. No more guilt about rice.", img: "/clients/desisquats/neeti.webp" },
              { name: "Hari", result: "Gained 10 lbs Muscle", quote: "Strength training changed my life. I feel more energetic at work than ever before.", img: "/clients/desisquats/hari.webp" },
            ].map((t) => (
              <div key={t.name} className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors">
                <div className="overflow-hidden">
                  <img src={t.img} alt={t.name} className="w-full h-auto object-contain" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#f61] text-[#f61]" />)}
                  </div>
                  <h3 className="text-base font-bold text-white">{t.name}</h3>
                  <p className="text-[#f61] text-sm font-semibold mt-0.5">{t.result}</p>
                  <p className="text-zinc-400 text-sm italic mt-3 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE BEST VERSION OF YOU
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">BIGGER THAN WEIGHT LOSS</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            THE BEST VERSION OF YOU<br /><span className="text-[#f61]">HAS BEEN THERE ALL ALONG.</span>
          </h2>
          <p className="mt-6 text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
            You aren&apos;t trying to become someone else. You&apos;re uncovering the version of yourself that&apos;s been buried under years of stress, long workdays, family responsibilities, and putting yourself last.
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Healthier", icon: "🌱" },
              { label: "Stronger", icon: "💪" },
              { label: "More Confident", icon: "🔥" },
              { label: "More Energetic", icon: "⚡" },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-white/[0.06] rounded-2xl p-6">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-bold text-white mt-3">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-zinc-500 max-w-md mx-auto">
            DesiSquats isn&apos;t just about losing weight. Because when your health improves, everything else improves with it.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ABOUT COACH — Premium split
          ═══════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
              <img
                src="/clients/desisquats/scientific-process.webp"
                alt="Coach Praneeth training"
                className="w-full aspect-square object-cover"
              />
            </div>
            {/* Stats badge */}
            <div className="absolute -bottom-5 -right-5 bg-gradient-to-br from-[#f61] to-[#e55a00] text-white px-6 py-4 rounded-2xl shadow-xl">
              <p className="text-3xl font-extrabold">100+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Success Stories</p>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">FOUNDER • DESISQUATS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight mb-6">
              MEET PRANEETH
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              I didn&apos;t create DesiSquats because I&apos;m just another fitness coach. I created it because I&apos;ve lived the same life as you. After moving to the United States over 16 years ago, I experienced the same challenges every NRI faces — balancing a demanding career, family responsibilities, travel, Indian food, and a busy lifestyle.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "16+ years living the NRI lifestyle in America",
                "Coached 550+ Indian professionals",
                "People don't need more fitness information — they need a system that works in real life",
                "That's why I built The DesiSquats System™",
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
              START YOUR JOURNEY
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS — Premium timeline
          ═══════════════════════════════════════════════════════════════ */}
      <section id="process" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              YOUR TRANSFORMATION JOURNEY
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "DISCOVER", desc: "We uncover what's really holding your lifestyle back." },
              { num: "02", title: "PERSONALIZE", desc: "We build a plan around your life — diet and exercise that fit." },
              { num: "03", title: "EXECUTE", desc: "You start working, with your coach beside you the whole way." },
              { num: "04", title: "TRANSFORM", desc: "You see the results — and keep them, for life." },
            ].map((step) => (
              <div key={step.num} className="relative bg-[#111] border border-white/[0.06] rounded-2xl p-6 hover:border-[#f61]/20 transition-colors">
                <span className="text-4xl font-extrabold text-[#f61]/20">{step.num}</span>
                <h3 className="text-sm font-bold text-white mt-3 mb-2 tracking-wide">{step.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          REAL-LIFE DECISION SUPPORT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">WHAT MAKES US DIFFERENT</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              REAL-LIFE DECISION SUPPORT
            </h2>
            <p className="mt-4 text-sm text-zinc-400 max-w-lg mx-auto">
              Most coaching programs tell you what to eat. DesiSquats helps you answer the questions real life actually throws at you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "What should I eat at an Indian restaurant?",
              "What if I'm traveling this week?",
              "How do I recover after a weekend?",
              "What happens after vacation?",
              "Parents are visiting — what now?",
              "How do I handle weddings?",
              "How do I stay consistent when work gets stressful?",
            ].map((q) => (
              <div key={q} className="flex items-start gap-3 bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3">
                <Check className="h-4 w-4 text-[#f61] shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{q}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-zinc-500 italic max-w-lg mx-auto">
            Because transformation isn&apos;t built on perfect days. It&apos;s built on making better decisions during imperfect ones.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA — Premium dark section
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/clients/desisquats/hero-bg.webp" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-[0.95]">
            YOUR LIFESTYLE DOESN&apos;T<br />NEED TO CHANGE.<br /><span className="text-[#f61]">YOUR STRATEGY DOES.</span>
          </h2>
          <p className="mt-6 text-base text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Join 550+ Indian professionals across America who have transformed their health without giving up the food, culture, or lifestyle they love.
          </p>
          <Link
            href="/enquiry"
            className="group inline-flex items-center gap-2 mt-10 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-base font-bold uppercase tracking-wider px-10 py-5 rounded-lg transition-all shadow-[0_4px_30px_rgba(255,102,17,0.4)] hover:shadow-[0_8px_50px_rgba(255,102,17,0.5)]"
          >
            START YOUR JOURNEY
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
            <a href="#programs" className="hover:text-white transition-colors">Programs</a>
            <a href="#results" className="hover:text-white transition-colors">Results</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="https://www.instagram.com/desisquats" target="_blank" rel="noopener noreferrer" className="hover:text-[#f61] transition-colors">Instagram</a>
          </div>
        </div>
        <p className="text-center text-[10px] text-zinc-700 mt-6 uppercase tracking-wider">
          © {new Date().getFullYear()} DesiSquats. All rights reserved.
        </p>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/19712706678"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
    </div>
  );
}
