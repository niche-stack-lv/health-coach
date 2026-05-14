"use client";

import Link from "next/link";
import {
  Dumbbell,
  ArrowLeft,
  Utensils,
  ClipboardList,
  Camera,
  BarChart3,
  Target,
  ChevronRight,
} from "lucide-react";
import { config } from "@/lib/config";

const aboutPlatform = config.aboutPlatform as any;
const icons = [Utensils, ClipboardList, Camera, BarChart3, Target];
const steps = aboutPlatform?.features?.map((f: any, i: number) => ({ ...f, icon: icons[i] })) || [];

export default function AboutPlatform() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2 group">
          <ArrowLeft className="h-4 w-4 text-zinc-500 group-hover:text-gold transition-colors" />
          <div className="h-7 w-7 rounded gradient-gold flex items-center justify-center">
            <Dumbbell className="h-3.5 w-3.5 text-black" />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.25em]">{config.brand.name}</span>
        </Link>
        <Link href="/enquiry" className="bg-gold text-black px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all">
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28 px-6 text-center border-b border-white/[0.04]">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-light mb-6">How It Works</p>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.9] max-w-4xl mx-auto">
          Your Transformation,
          <span className="block text-gradient-gold mt-2">Step by Step</span>
        </h1>
        <p className="mt-8 text-sm sm:text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          {aboutPlatform?.heroSubtitle}
        </p>
        <div className="mt-6 inline-block rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2.5">
          <p className="text-[10px] sm:text-xs text-amber-400/90 font-medium">⚠️ {aboutPlatform?.disclaimer}</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — alternating layout with live app previews
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-24 sm:space-y-32">
          {steps.map((s, i) => (
            <div key={s.step} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
              {/* Text */}
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] text-gold/50 font-mono tracking-wider">STEP {s.step}</span>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.05em]">{s.title}</h2>
                </div>
                <p className="text-sm text-zinc-400 font-light leading-[1.9] max-w-md">{s.desc}</p>
                <Link href={s.demoPath} target="_blank"
                  className="inline-flex items-center gap-1.5 mt-6 text-[11px] uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors font-medium">
                  Try it live <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Live preview in phone frame */}
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className={`relative mx-auto w-full max-w-[320px] rounded-[2rem] border-[3px] border-zinc-800 bg-gradient-to-b ${s.color} to-black/50 overflow-hidden shadow-2xl shadow-black/50`}>
                  {/* Phone notch */}
                  <div className="h-6 bg-black flex items-center justify-center">
                    <div className="h-2.5 w-20 rounded-full bg-zinc-900" />
                  </div>
                  {/* iframe */}
                  <div className="h-[520px] overflow-hidden bg-zinc-950">
                    <iframe
                      src={s.demoPath}
                      className="w-[375px] h-[700px] origin-top-left border-0 pointer-events-none"
                      style={{ transform: "scale(0.853)", transformOrigin: "top left" }}
                      title={s.title}
                      loading="lazy"
                    />
                  </div>
                  {/* Phone bottom bar */}
                  <div className="h-5 bg-black flex items-center justify-center">
                    <div className="h-1 w-28 rounded-full bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW RAJAT WORKS WITH YOU
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-light mb-6">The Process</p>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-[0.9]">
              How {config.coach.firstName} Works <span className="text-gradient-gold">With You</span>
            </h2>
          </div>

          <div className="space-y-0">
            {(aboutPlatform?.processSteps || []).map((item: any, i: number) => ({ num: String(i + 1), ...item })).map((item: any, i: number) => (
              <div key={item.num} className="flex gap-6 py-8 border-b border-white/[0.04] last:border-0">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full border border-gold/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-gold">{item.num}</span>
                  </div>
                  {i < 4 && <div className="w-px h-full bg-white/[0.04] mx-auto mt-2" />}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Ready to <span className="text-gradient-gold">Start</span>?
          </h2>
          <p className="mt-4 text-sm text-zinc-500 font-light">
            {aboutPlatform?.ctaText}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/enquiry"
              className="bg-gold text-black px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all duration-300 hover:-translate-y-0.5">
              Start Your Transformation
            </Link>
            <Link href="/pricing"
              className="border border-white/20 text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5">
              View Plans & Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6 text-center">
        <p className="text-[9px] text-zinc-800 uppercase tracking-[0.2em] font-light">
          {`© ${new Date().getFullYear()} ${config.brand.copyrightHolder}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
