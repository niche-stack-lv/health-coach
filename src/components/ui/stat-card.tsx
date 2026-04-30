import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "group rounded-2xl border border-white/[0.06] bg-[#141414] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,168,83,0.06)] hover:border-gold/20 hover:-translate-y-0.5",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              trend.value >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        <div className="rounded-xl bg-white/[0.04] p-2.5 transition-all group-hover:bg-gold/10">
          <Icon className="h-5 w-5 text-zinc-500 group-hover:text-gold transition-colors" />
        </div>
      </div>
    </div>
  );
}
