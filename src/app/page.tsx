import Link from "next/link";
import Image from "next/image";
import { Dumbbell, MessageCircle } from "lucide-react";
import { config } from "@/lib/config";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          TOP NAV
          ═══════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-10 py-4 sm:py-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded gradient-gold flex items-center justify-center">
            <Dumbbell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-black" />
          </div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">{config.brand.name}</span>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════════ */}
      {/* Text on black */}
      <section className="bg-black pt-20 sm:pt-24 pb-6 sm:pb-8 text-center px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[9px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gold/80 font-light mb-5 sm:mb-8">
            {`Welcome to ${config.brand.name}`}
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase leading-[0.92] sm:leading-[0.88] tracking-tight text-white">
            India&apos;s First
            <span className="block text-gradient-gold">Personalized</span>
            <span className="block">Coaching Platform</span>
          </h1>
          <p className="mt-5 sm:mt-8 text-sm sm:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-300 font-light">
            {config.coach.heroByline}
          </p>
        </div>
      </section>

      {/* ── Hero Image — IMG_main, seamlessly blended ── */}
      <section className="relative bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Image src={config.images.heroImage} alt={config.coach.name} width={1200} height={800} className="w-full h-auto object-cover" priority />
            {/* Blend edges into black */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-black text-center px-4 sm:px-6 pt-4 sm:pt-6 pb-12 sm:pb-16">
        <div className="max-w-xl mx-auto">
          <Link href="/pricing"
            className="inline-block bg-gold text-black px-14 sm:px-20 py-5 sm:py-6 shadow-[0_0_30px_rgba(212,168,83,0.25)] hover:shadow-[0_0_45px_rgba(212,168,83,0.45)] hover:bg-gold-light transition-all duration-300 hover:-translate-y-0.5">
            <span className="block text-sm sm:text-lg font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">{config.brand.heroCta}</span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] mt-1.5 animate-pulse">{config.brand.heroCtaSub}</span>
          </Link>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/login" className="text-xs sm:text-sm uppercase tracking-[0.15em] text-zinc-400 hover:text-gold transition-colors font-medium">
              Already a member? Sign in →
            </Link>
            <div className="flex items-center gap-5">
              <Link href="/book-call" className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-gold/80 hover:text-gold transition-colors font-semibold">
                📞 Book a Call
              </Link>
              <span className="text-zinc-800">·</span>
              <Link href="/about-platform" className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-zinc-500 hover:text-gold transition-colors font-medium">
                Explore Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: ABOUT — Split layout with photo + achievements
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-black">
        {/* Desktop: side-by-side grid */}
        <div className="hidden lg:grid lg:grid-cols-2">
          <div className="relative min-h-[70vh]">
            <Image src={config.images.aboutImage} alt={`Coach ${config.coach.firstName}`} fill className="object-cover object-top" sizes="50vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
          </div>
          <div className="flex flex-col justify-center px-20 py-20">
            <h2 className="text-5xl font-black uppercase tracking-tight leading-[0.9]">
              Meet Coach
              <span className="block text-gradient-gold">{config.coach.name}</span>
            </h2>
            <p className="mt-8 text-sm text-zinc-400 leading-[2] font-light max-w-lg">
              {config.coach.bio}
            </p>
            <p className="mt-4 text-sm text-zinc-500 leading-[2] font-light max-w-lg">
              {config.coach.bioSecondary}
            </p>
          </div>
        </div>

        {/* Mobile: photo background with text overlay */}
        <div className="lg:hidden relative">
          <div className="relative h-[45vh]">
            <Image src={config.images.aboutImage} alt={`Coach ${config.coach.firstName}`} fill className="object-cover object-top" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
          <div className="relative bg-black px-6 py-10 -mt-20 z-10">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-[0.9]">
              Meet Coach
              <span className="block text-gradient-gold">{config.coach.name}</span>
            </h2>
            <p className="mt-5 text-sm text-zinc-400 leading-[1.8] font-light">
              {config.coach.bio}
            </p>
            <p className="mt-3 text-sm text-zinc-500 leading-[1.8] font-light">
              {config.coach.bioSecondary}
            </p>
          </div>
        </div>
      </section>

      {/* ── Achievements + Photos — 4 stats paired with 4 images ── */}
      <section className="bg-black py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {config.achievements.map((item) => (
            <div key={item.label} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <img src={item.image} alt="" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <p className="text-2xl sm:text-3xl font-black text-gold">{item.value}</p>
                  <p className="text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-[0.15em] mt-1 font-light leading-tight">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: TESTIMONIALS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-36 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-light mb-6">Results</p>
            <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight leading-[0.9]">
              Client <span className="text-gradient-gold">Transformations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {config.testimonials.map((t) => (
              <div key={t.name} className="border border-white/[0.04] overflow-hidden">
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
                  <img src={t.image} alt="" className="w-full h-full object-cover object-top" />
                  <div className="absolute top-0 left-0 right-0 backdrop-blur-lg bg-black/15" style={{ height: t.blur }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                {/* Quote */}
                <div className="p-4 sm:p-6 bg-black">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-[1.7] sm:leading-[1.9] font-light italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-3 sm:mt-4 flex items-center gap-3">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white font-bold">{t.name}</p>
                    <span className="text-zinc-800">·</span>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold/70 font-light">{t.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: PROGRAMS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-36 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-light mb-6">Programs</p>
            <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight leading-[0.9]">
              Choose Your <span className="text-gradient-gold">Path</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {config.programs.map((p) => (
              <Link key={p.name} href="/pricing"
                className={`relative overflow-hidden group aspect-square sm:aspect-[4/3] bg-gradient-to-b ${p.gradient} border border-white/[0.04] hover:border-gold/20 transition-all duration-300`}>
                <div className="h-full flex flex-col items-center justify-center text-center px-3 sm:px-6">
                  <span className="text-3xl sm:text-5xl mb-3 sm:mb-5 group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
                  <h3 className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white">{p.name}</h3>
                  <p className="text-[8px] sm:text-[10px] text-zinc-500 mt-1.5 sm:mt-2 font-light leading-relaxed max-w-[200px] hidden sm:block">{p.desc}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-light hidden sm:block">
                    View Plans →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FLOATING WHATSAPP
          ═══════════════════════════════════════════════════════════════ */}
      <Link href="/enquiry"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#25D366] pl-5 pr-4 py-3 shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:scale-105 transition-all active:scale-95">
        <span className="text-white text-xs font-bold uppercase tracking-wider">Send Enquiry</span>
        <MessageCircle className="h-5 w-5 text-white" />
      </Link>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 sm:gap-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded gradient-gold flex items-center justify-center">
              <Dumbbell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-black" />
            </div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">{config.brand.name}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-5 sm:gap-8 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-light">
            <Link href="/enquiry" className="text-zinc-600 hover:text-gold transition-colors">Get Started</Link>
            <Link href="/pricing" className="text-zinc-600 hover:text-gold transition-colors">Plans</Link>
            <Link href="/login" className="text-zinc-600 hover:text-gold transition-colors">Sign In</Link>
            <Link href="/coach?demo=true" className="text-zinc-600 hover:text-gold transition-colors">Demo: Coach</Link>
            <Link href="/client?demo=true" className="text-zinc-600 hover:text-gold transition-colors">Demo: Client</Link>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer"
              className="text-zinc-700 hover:text-gold transition-colors text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-light">Instagram</a>
            <a href={config.contact.youtube} target="_blank" rel="noopener noreferrer"
              className="text-zinc-700 hover:text-gold transition-colors text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-light">YouTube</a>
            <a href={`https://wa.me/${config.contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
              className="text-zinc-700 hover:text-gold transition-colors text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-light">WhatsApp</a>
          </div>

          <p className="text-[9px] text-zinc-800 uppercase tracking-[0.2em] font-light">
            {`© ${new Date().getFullYear()} ${config.brand.copyrightHolder}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
