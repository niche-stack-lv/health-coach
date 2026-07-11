import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

/**
 * Where Stripe redirects after a successful Payment Link checkout.
 *
 * Provisioning (auth user + client row + password-setup email) happens on the
 * server via the /api/stripe/webhook route — this page is purely a success
 * confirmation. Never grant access based on this URL; always trust the webhook.
 */
export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight leading-tight">
          Payment confirmed
        </h1>
        <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
          Welcome to DesiSquats. We&apos;re setting up your account right now.
        </p>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-[#f61] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Check your email</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                We just sent an email to set your password and access your dashboard. If you don&apos;t see it in a few minutes, check spam or reach out on WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
          >
            Go to login
          </Link>
          <a
            href="https://wa.me/19712706678"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all hover:bg-white/[0.03]"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
