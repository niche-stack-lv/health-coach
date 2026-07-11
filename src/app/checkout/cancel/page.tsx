import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/[0.04] flex items-center justify-center">
          <XCircle className="h-8 w-8 text-zinc-400" />
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight leading-tight">
          Payment cancelled
        </h1>
        <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
          No charge was made. You can restart the checkout whenever you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f61] to-[#e55a00] hover:from-[#ff7722] hover:to-[#f61] text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
          >
            Back to checkout
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all hover:bg-white/[0.03]"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
