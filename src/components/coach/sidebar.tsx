"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, UtensilsCrossed,
  Dumbbell, Settings, Menu, X, LogOut, TrendingUp, CalendarDays,
} from "lucide-react";

const navItems = [
  { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/leads", label: "Leads", icon: TrendingUp },
  { href: "/coach/clients", label: "Clients", icon: Users },
  { href: "/coach/dishes", label: "Foods & Dishes", icon: UtensilsCrossed },
  { href: "/coach/diet-templates", label: "Diet Templates", icon: CalendarDays },
  { href: "/coach/workout-templates", label: "Workout Templates", icon: Dumbbell },
];

export function CoachSidebar() {
  return <Suspense><CoachSidebarInner /></Suspense>;
}

function CoachSidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const searchParams = useSearchParams();
  const demo = searchParams.get("demo") === "true" ? "?demo=true" : "";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
    const isActive = pathname === href || (href !== "/coach" && pathname.startsWith(href));
    return (
      <Link href={`${href}${demo}`} onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gold/10 text-gold border border-gold/20"
            : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 border border-transparent"
        )}>
        <Icon className="h-[18px] w-[18px]" />
        {label}
      </Link>
    );
  }

  const coachProfile = (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-3 py-2">
        <Image src={config.images.coachPhoto} alt={`Coach ${config.coach.firstName}`} width={36} height={36}
          className="rounded-xl object-cover h-9 w-9 ring-1 ring-gold/30" />
        <div>
          <p className="text-sm font-semibold text-white">{config.coach.firstName}</p>
          <p className="text-[11px] text-gold/60 font-medium">{config.coach.title}</p>
        </div>
      </div>
      <button onClick={handleSignOut} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-red-400 transition-colors w-full">
        <LogOut className="h-[18px] w-[18px]" /> Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] glass-dark px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-gold shadow-sm">
            <Dumbbell className="h-4 w-4 text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">{config.brand.name}</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors">
          {open ? <X className="h-5 w-5 text-zinc-400" /> : <Menu className="h-5 w-5 text-zinc-400" />}
        </button>
      </header>

      {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <div className={cn(
        "lg:hidden fixed top-14 left-0 right-0 z-30 glass-dark border-b border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      )}>
        <nav className="px-3 py-3 space-y-1">
          {navItems.map((item) => <NavLink key={item.href} {...item} />)}
          <NavLink href="/coach/settings" label="Settings" icon={Settings} />
        </nav>
        <div className="px-3 py-3 border-t border-white/[0.06]">{coachProfile}</div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 border-r border-white/[0.06] bg-[#0e0e0e] flex-col">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/[0.06]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-gold shadow-sm">
            <Dumbbell className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">{config.brand.name}</h1>
            <p className="text-[11px] text-gold/50 -mt-0.5 font-medium">Pro Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
          <NavLink href="/coach/settings" label="Settings" icon={Settings} />
          {coachProfile}
        </div>
      </aside>
    </>
  );
}
