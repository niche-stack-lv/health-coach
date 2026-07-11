"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

type PlanKey = "guided" | "coach_led";

interface Plan {
  key: PlanKey;
  eyebrow: string;
  name: string;
  price: string;
  regular: string;
  duration: string;
  blurb: string;
  bullets: string[];
  link: string;
}

// Read env vars with static keys so Next.js inlines them at build time
// (dynamic string keys skip that inlining, which caused a client-vs-server
// hydration mismatch on this page).
const LINK_GUIDED    = process.env.NEXT_PUBLIC_STRIPE_LINK_GUIDED    || "";
const LINK_COACH_LED = process.env.NEXT_PUBLIC_STRIPE_LINK_COACH_LED || "";

const PLANS: Plan[] = [
  {
    key: "guided",
    eyebrow: "The Guided Journey",
    name: "Self-Paced with the DesiSquats System™",
    price: "$399",
    regular: "$499",
    duration: "/ 100 days",
    blurb: "For self-motivated professionals who want the right system.",
    bullets: [
      "Personalized Nutrition Strategy",
      "Customized Workout Plan",
      "DesiSquats Dashboard",
      "Grocery & Restaurant Guides",
      "Indian Food Swaps",
      "Mindset & Strategy Library",
      "WhatsApp Community",
    ],
    link: LINK_GUIDED,
  },
  {
    key: "coach_led",
    eyebrow: "The Coach-Led Journey",
    name: "1-on-1 Coaching with Praneeth",
    price: "$999",
    regular: "$1,199",
    duration: "/ 100 days",
    blurb: "For professionals who want Praneeth personally guiding them.",
    bullets: [
      "Weekly 1-on-1 Coaching",
      "Daily WhatsApp Real-Life Decision Support",
      "Direct Access to Coach Praneeth",
      "Weekly Adjustments",
      "Travel & Restaurant Planning",
      "Plateau Troubleshooting",
      "Priority Support",
    ],
    link: LINK_COACH_LED,
  },
];

export default function CheckoutPage() {
  const [selected, setSelected] = useState<PlanKey>("coach_led");

  const paymentUrl = useMemo(() => {
    const plan = PLANS.find((p) => p.key === selected);
    return plan?.link || "";
  }, [selected]);

  const notConfigured = !paymentUrl;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <nav className="border-b border-white/[0.06] bg-[rgba(10,10,10,0.92)] backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-5 sm:px-8 h-[64px]">
          <Link href="/" className="text-[13px] font-semibold text-zinc-400 hover:text-white">
            ← Back
          </Link>
          <p className="text-[11px] font-bold text-[#f61] uppercase tracking-[0.2em]">DesiSquats · Checkout</p>
          <span className="w-16" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
            CHOOSE YOUR JOURNEY
          </h1>
          <p className="mt-3 text-sm text-zinc-500 max-w-lg mx-auto">
            Pick the option that fits, then continue to secure payment on Stripe. Your account is created automatically after payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLANS.map((plan) => {
            const active = plan.key === selected;
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelected(plan.key)}
                className={`text-left bg-[#111] rounded-2xl p-6 transition-all border-2 ${
                  active
                    ? "border-[#f61] shadow-[0_4px_30px_rgba(255,102,17,0.15)]"
                    : "border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? "text-[#f61]" : "text-zinc-400"}`}>
                    {plan.eyebrow}
                  </span>
                  <span
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      active ? "border-[#f61] bg-[#f61]" : "border-white/20"
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-black" />}
                  </span>
                </div>
                <p className="text-lg font-bold text-white mb-1">{plan.name}</p>
                <p className="text-3xl font-extrabold text-white">
                  <span className="text-base font-normal text-zinc-600 line-through mr-2">{plan.regular}</span>
                  {plan.price}
                  <span className="text-base font-normal text-zinc-500"> {plan.duration}</span>
                </p>
                <p className="text-sm text-zinc-400 mt-3 mb-5">{plan.blurb}</p>
                <ul className="space-y-2">
                  {plan.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${active ? "text-[#f61]" : "text-zinc-500"}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Continue */}
        <div className="mt-8">
          {notConfigured ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
              Stripe isn&apos;t configured yet.{" "}
              <span className="text-amber-100/80">
                Ask an admin to set <code className="mx-1 px-1.5 py-0.5 rounded bg-black/30">NEXT_PUBLIC_STRIPE_LINK_GUIDED</code> and{" "}
                <code className="mx-1 px-1.5 py-0.5 rounded bg-black/30">NEXT_PUBLIC_STRIPE_LINK_COACH_LED</code> in the deployment.
              </span>
            </div>
          ) : (
            <a
              href={paymentUrl}
              className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-base font-bold uppercase tracking-wider px-8 py-4 rounded-xl transition-all shadow-[0_4px_30px_rgba(255,102,17,0.35)]"
            >
              Continue to secure payment
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
          <p className="mt-3 text-center text-[11px] text-zinc-600">
            Payments processed by Stripe. You&apos;ll receive an email to set up your DesiSquats account once payment is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
