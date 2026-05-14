"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MessageCircle, Play, Star, Users, Trophy, Target } from "lucide-react";

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
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Limited spots available</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
              <span className="block text-white">YOU DON&apos;T NEED A</span>
              <span className="block text-white">COACH FROM INDIA</span>
              <span className="block text-[#f61] mt-2">GUESSING YOUR U.S. LIFE.</span>
            </h1>

            <p className="mt-8 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md">
              Premium transformation coaching for Indian professionals in the U.S. who want to lose belly fat, rebuild energy, and stay consistent — without giving up Indian food.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Long workdays", "Eating out", "Travel", "Family", "Stress", "Inconsistent routines"].map((tag) => (
                <span key={tag} className="text-[11px] text-zinc-500 border border-white/[0.08] rounded-full px-3 py-1">{tag}</span>
              ))}
            </div>

            <p className="mt-6 text-sm text-zinc-500 italic">
              This is not a generic meal plan. It&apos;s a system designed for the life you actually live.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/enquiry"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg transition-all shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_8px_40px_rgba(255,102,17,0.4)]"
              >
                APPLY FOR COACHING
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#results"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg transition-all hover:bg-white/[0.03]"
              >
                <Play className="h-4 w-4" />
                SEE RESULTS
              </a>
            </div>

            {/* Social proof strip */}
            <div className="mt-12 flex items-center gap-6 border-t border-white/[0.06] pt-6">
              <div>
                <p className="text-2xl font-bold text-white">100+</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Transformations</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Client Rating</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <p className="text-2xl font-bold text-white">US</p>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Based Coach</p>
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
          CORE PRINCIPLES — Glass cards
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f61]/[0.02] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Target className="h-6 w-6" />,
                title: "YOUR LIFESTYLE CHANGED",
                desc: "Long work hours. Late dinners. Eating out. Weekend events. Stress. Your fitness system never adapted to your U.S. life.",
                gradient: "from-orange-500/20 to-transparent",
              },
              {
                icon: <Trophy className="h-6 w-6" />,
                title: "NOTHING STUCK",
                desc: "You tried diets before. You tried workouts before. But nothing stuck because the plan was never built around your real lifestyle here.",
                gradient: "from-amber-500/20 to-transparent",
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "LIVED EXPERIENCE, NOT THEORY",
                desc: "Most coaches understand Indian food. Very few understand Indian life in the U.S. I've been living it for 17 years.",
                gradient: "from-red-500/20 to-transparent",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="relative bg-[#111] border border-white/[0.08] rounded-2xl p-8 overflow-hidden group hover:border-[#f61]/30 transition-all duration-300"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient}`} />
                <div className="h-12 w-12 rounded-xl bg-[#f61]/10 flex items-center justify-center text-[#f61] mb-5">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-3 tracking-wide">{card.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY US — Premium feature grid
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">WHY THIS WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              BUILT FOR REAL LIFE
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Star className="h-5 w-5" />, title: "INDIAN FOOD STRUCTURED", desc: "Your favorite meals — dal, roti, biryani — structured properly for your goals." },
              { icon: <Users className="h-5 w-5" />, title: "U.S. RESTAURANT GUIDANCE", desc: "Eating out strategies for Chipotle, Indian buffets, and corporate lunches." },
              { icon: <Trophy className="h-5 w-5" />, title: "WORKDAY STRATEGIES", desc: "Meal timing and prep that works with long hours and unpredictable schedules." },
              { icon: <Target className="h-5 w-5" />, title: "REAL ACCOUNTABILITY", desc: "Weekly check-ins, real-time coaching for Elite clients. No ghosting." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/[0.12] transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-[#f61] mx-auto mb-4">
                  {feature.icon}
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
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">WHY ME</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight leading-tight">
              MOST COACHES UNDERSTAND INDIAN FOOD.<br />
              <span className="text-[#f61]">VERY FEW UNDERSTAND INDIAN LIFE IN THE U.S.</span>
            </h2>
            <p className="mt-4 text-sm text-zinc-500">I am living that currently.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Long work hours",
              "Late dinners",
              "Eating out",
              "Travel",
              "Work stress",
              "Family responsibilities",
              "Trying to stay fit while balancing all of it",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3">
                <Check className="h-4 w-4 text-[#f61] shrink-0" />
                <span className="text-sm text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-zinc-500 italic">
            This system was built from lived experience — not theory.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE DESI METHOD™
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">THE SYSTEM</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            THE DESI METHOD™
          </h2>
          <p className="mt-4 text-sm text-zinc-500 max-w-lg mx-auto">
            A transformation system built specifically for Indian professionals living in the U.S.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { letter: "D", title: "DIAGNOSE", desc: "Your lifestyle" },
              { letter: "E", title: "ELIMINATE", desc: "Bad patterns" },
              { letter: "S", title: "STRUCTURE", desc: "Indian nutrition" },
              { letter: "I", title: "IMPLEMENT", desc: "Accountability" },
            ].map((step) => (
              <div key={step.letter} className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 hover:border-[#f61]/20 transition-colors">
                <span className="text-4xl font-extrabold text-[#f61]">{step.letter}</span>
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
              PROGRAMS
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* BASIC */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 hover:border-[#f61]/30 transition-all">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">BASIC COACHING</span>
              </div>
              <p className="text-3xl font-extrabold text-white">$300 <span className="text-base font-normal text-zinc-500">/ 3 months</span></p>
              <p className="text-sm text-zinc-400 mt-3 mb-6">For self-driven clients who want structure and education.</p>
              <div className="space-y-3">
                {["Group onboarding", "Structured Indian diet plan", "Workout plan", "Weekly group check-ins", "E-book access", "FAQ video library"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/enquiry" className="block mt-8">
                <button className="w-full bg-white/[0.06] border border-white/[0.1] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-white/[0.1] transition-colors">
                  APPLY NOW
                </button>
              </Link>
            </div>

            {/* ELITE */}
            <div className="bg-[#111] border-2 border-[#f61]/40 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f61] to-[#e55a00]" />
              <div className="inline-flex items-center gap-2 bg-[#f61]/10 border border-[#f61]/20 rounded-full px-3 py-1 mb-4">
                <span className="text-[11px] font-bold text-[#f61] uppercase tracking-wider">ELITE TRANSFORMATION</span>
              </div>
              <p className="text-3xl font-extrabold text-white">$1000 <span className="text-base font-normal text-zinc-500">/ 3 months</span></p>
              <p className="text-xs text-zinc-500 mt-1">or $1800 / 6 months</p>
              <p className="text-sm text-zinc-400 mt-3 mb-6">For professionals who want accountability, guidance, and real transformation.</p>
              <div className="space-y-3">
                {["1-on-1 onboarding", "Personalized lifestyle system", "Daily WhatsApp access", "Weekly 1-on-1 check-ins", "Real-time corrections", "Eating out & travel guidance"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#f61] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-4 italic">You don&apos;t just get a plan. You get direct coaching.</p>
              <Link href="/enquiry" className="block mt-6">
                <button className="w-full bg-gradient-to-r from-[#f61] to-[#e55a00] text-white text-sm font-bold uppercase tracking-wider py-4 rounded-lg shadow-[0_4px_20px_rgba(255,102,17,0.3)] hover:shadow-[0_4px_30px_rgba(255,102,17,0.5)] transition-all">
                  APPLY NOW
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
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">REAL TRANSFORMATIONS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
              FROM INDIAN PROFESSIONALS IN THE U.S.
            </h2>
            <p className="text-sm text-zinc-500 mt-4 max-w-lg mx-auto">No crash diets. No unrealistic meal prep. No giving up Indian food. Just structure, accountability, and consistency.</p>
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
          BIGGER THAN WEIGHT LOSS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">BIGGER THAN WEIGHT LOSS</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            THIS WAS NEVER JUST ABOUT<br /><span className="text-[#f61]">LOSING WEIGHT.</span>
          </h2>
          <p className="mt-6 text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Fitness made me a better husband, a better father, a better employee, and a more confident, disciplined person overall.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: "Energy improves", icon: "⚡" },
              { label: "Confidence improves", icon: "💪" },
              { label: "Discipline improves", icon: "🎯" },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-white/[0.06] rounded-2xl p-6">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-bold text-white mt-3">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-zinc-500 max-w-md mx-auto">
            …every part of your life improves with it. DesiSquats is about building a healthier, stronger, more confident version of yourself.
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
            <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em] mb-3">YOUR COACH</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight mb-6">
              MEET COACH PRANEETH
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              I came to the U.S. in 2009 as a student, completed my PhD, and spent 10+ years working in corporate America while building DesiSquats.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "Student life → corporate work stress → eating out constantly",
                "Married life → parenthood → balancing it all",
                "17 years of lived U.S. experience as an Indian professional",
                "Every plan built from experience, not theory",
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
              THE DESISQUATS PROCESS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "APPLY", desc: "Tell us your goals, lifestyle, and food preferences. We assess if we're the right fit." },
              { num: "02", title: "GET YOUR PLAN", desc: "Receive a custom training and nutrition blueprint built around Indian food." },
              { num: "03", title: "CHECK IN WEEKLY", desc: "Stay on track with weekly coaching, adjustments, and direct support." },
              { num: "04", title: "TRANSFORM", desc: "Watch your body, energy, and confidence transform over 12-16 weeks." },
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
          FINAL CTA — Premium dark section
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/clients/desisquats/hero-bg.webp" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-[0.95]">
            READY TO STOP<br /><span className="text-[#f61]">RESTARTING?</span>
          </h2>
          <p className="mt-6 text-base text-zinc-400 leading-relaxed max-w-lg mx-auto">
            If you&apos;re tired of belly fat, low energy, inconsistency, and restarting every few months — this is your next step. A premium coaching system built from 17 years of U.S. lifestyle experience and hundreds of Indian client transformations.
          </p>
          <Link
            href="/enquiry"
            className="group inline-flex items-center gap-2 mt-10 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-base font-bold uppercase tracking-wider px-10 py-5 rounded-lg transition-all shadow-[0_4px_30px_rgba(255,102,17,0.4)] hover:shadow-[0_8px_50px_rgba(255,102,17,0.5)]"
          >
            APPLY NOW
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
