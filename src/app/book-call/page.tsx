"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Copy, Upload, Phone, Download } from "lucide-react";
import { generateConfirmationPDF } from "@/lib/confirmation-pdf";
import { saveLead } from "@/lib/db";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { config, formatPrice } from "@/lib/config";

const UPI_ID = config.contact.upiId;
const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function BookCallPage() {
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const WHATSAPP_NUMBER = config.contact.whatsappNumber;

  const copyUPI = () => { navigator.clipboard.writeText(UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const generateConfirmation = () => {
    generateConfirmationPDF({
      name, phone, email,
      planLabel: `Phone Consultation (${config.pricing?.callDuration})`,
      price: formatPrice(config.pricing?.callPrice || 0),
      type: "call",
    }).catch(console.error);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await saveLead({ source: "book-call", name, phone, email, plan_label: `Phone Consultation (${config.pricing?.callDuration})`, price: formatPrice(config.pricing?.callPrice || 0) });
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setDone(true);

    const msg = [
      `📞 *New Call Booking — ${config.brand.name}*`,
      ``,
      `*Client:* ${name}`,
      `*Phone:* ${phone}`,
      `*Email:* ${email}`,
      `*Service:* Phone Consultation (${formatPrice(config.pricing?.callPrice || 0)})`,
      ``,
      `Payment screenshot uploaded. Please schedule the call.`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 mx-auto">
            <Check className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">Booking Confirmed</h1>
          <p className="text-sm text-zinc-400 mt-3">Coach {config.coach.firstName} will reach out to you on WhatsApp within 24 hours to schedule your call.</p>
          <button onClick={generateConfirmation}
            className="mt-6 inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/[0.1] transition-colors rounded-xl">
            <Download className="h-4 w-4" /> Download Confirmation
          </button>
          <div className="mt-4">
            <Link href="/"><button className="bg-gold text-black px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-gold-light transition-colors rounded-xl">Back to Home</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/90 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-4">
          <Link href="/" className="p-1.5 -ml-1.5 hover:bg-white/[0.04] rounded-lg"><ArrowLeft className="h-5 w-5 text-zinc-400" /></Link>
          <div>
            <p className="text-sm font-bold text-white">Phone Consultation</p>
            <p className="text-[10px] text-gold uppercase tracking-wider font-semibold">{config.pricing?.callDuration} call with Coach {config.coach.firstName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12 space-y-6">
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-5 text-center">
          <Phone className="h-8 w-8 text-gold mx-auto mb-3" />
          <h1 className="text-lg font-black uppercase tracking-wide">1-on-1 with Coach {config.coach.firstName}</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">Get expert guidance on your goals, training, and nutrition in a personal {config.pricing?.callDuration} telephonic call.</p>
          <p className="text-4xl font-black text-gradient-gold mt-4">{formatPrice(config.pricing?.callPrice || 0)}</p>
          <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">One-time · No commitment</p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-4">Scan QR Code to Pay</p>
          <div className="inline-block bg-white p-3 rounded-lg">
            <Image src={config.images.upiQr} alt="UPI QR" width={200} height={200} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <code className="text-sm text-gold font-mono bg-gold/5 border border-gold/20 px-3 py-1.5 rounded-lg">{UPI_ID}</code>
            <button onClick={copyUPI} className="p-2 hover:bg-white/[0.04] rounded-lg">
              {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-zinc-500" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-3">Upload Payment Screenshot</p>
          <label className={cn("flex flex-col items-center justify-center border border-dashed rounded-xl p-8 cursor-pointer transition-colors",
            screenshot ? "border-gold/50 bg-gold/5" : "border-white/[0.08] hover:border-white/[0.15]"
          )}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
            {screenshot ? (<><Check className="h-6 w-6 text-gold mb-2" /><p className="text-xs text-gold">{screenshot.name}</p></>) : (<><Upload className="h-6 w-6 text-zinc-500 mb-2" /><p className="text-xs text-zinc-500">Tap to upload</p></>)}
          </label>
        </div>

        <div className="space-y-3">
          <div><label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} /></div>
          <div><label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">WhatsApp Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} /></div>
          <div><label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputClass} /></div>
        </div>

        <button onClick={handleConfirm} disabled={!screenshot || !name || !phone || !email || submitting}
          className="w-full bg-gold text-black py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-gold-light transition-colors disabled:opacity-50 rounded-xl">
          {submitting ? "Submitting..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
