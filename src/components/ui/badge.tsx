import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
  className?: string;
}

const variants = {
  default: "bg-white/[0.06] text-zinc-400 ring-1 ring-white/[0.08]",
  success: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  danger: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  info: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
  gold: "bg-gold/10 text-gold ring-1 ring-gold/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
