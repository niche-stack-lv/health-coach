"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { Dumbbell, Home, Camera, Flame, Ruler, CalendarCheck, HelpCircle, MoreHorizontal, UtensilsCrossed } from "lucide-react";

const mainNavItems = [
  { href: "/client", label: "Home", icon: Home },
  { href: "/client/food-check-in", label: "Daily", icon: CalendarCheck },
  { href: "/client/workout", label: "Workout", icon: Flame },
];

const menuItems = [
  { href: "/client/faq", label: "FAQs", icon: HelpCircle },
  { href: "/client/measurements", label: "Body", icon: Ruler },
  { href: "/client/check-in", label: "Weekly", icon: Camera },
  { href: "/client/diet-plan", label: "Diet", icon: UtensilsCrossed },
];

function NavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const demo = searchParams.get("demo") === "true" ? "?demo=true" : "";
  const [showMenu, setShowMenu] = useState(false);

  // Get initials from user email or name
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "ME";

  // Check if any menu item is active
  const isMenuActive = menuItems.some(item => pathname === item.href);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[0.06] glass-dark">
        <div className="mx-auto max-w-lg flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-gold shadow-sm">
              <Dumbbell className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-white tracking-tight">{config.brand.name}</span>
            {demo && <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">Demo</span>}
          </div>
          <Link href={`/client/profile${demo}`} className="h-8 w-8 rounded-xl bg-gold/10 flex items-center justify-center text-xs font-bold text-gold ring-1 ring-gold/20">
            {initials}
          </Link>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] glass-dark safe-area-bottom">
        <div className="mx-auto max-w-lg flex items-center justify-between px-1 py-1.5">
          {/* Main Nav Items */}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={`${item.href}${demo}`}
                className={cn("flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1.5 rounded-xl transition-all duration-200",
                  isActive ? "text-gold" : "text-zinc-600 active:scale-95"
                )}>
                <div className={cn("p-1 rounded-lg transition-colors", isActive && "bg-gold/10")}>
                  <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive && "text-gold")} />
                </div>
                <span className={cn("text-[9px] sm:text-[10px] font-semibold truncate", isActive && "text-gold")}>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Three Dot Menu */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={cn("flex flex-col items-center gap-0.5 w-full py-1.5 rounded-xl transition-all duration-200",
                isMenuActive ? "text-gold" : "text-zinc-600 active:scale-95"
              )}
            >
              <div className={cn("p-1 rounded-lg transition-colors", isMenuActive && "bg-gold/10")}>
                <MoreHorizontal className={cn("h-4 w-4 sm:h-5 sm:w-5", isMenuActive && "text-gold")} />
              </div>
              <span className={cn("text-[9px] sm:text-[10px] font-semibold", isMenuActive && "text-gold")}>More</span>
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                {/* Menu */}
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl z-50">
                  {menuItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={`${item.href}${demo}`}
                        onClick={() => setShowMenu(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                          idx === 0 && "rounded-t-xl",
                          idx === menuItems.length - 1 && "rounded-b-xl",
                          isActive 
                            ? "text-gold bg-gold/10" 
                            : "text-zinc-300 hover:bg-white/[0.06]"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", isActive && "text-gold")} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export function ClientNavbar() {
  return <Suspense><NavbarInner /></Suspense>;
}
