import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-white text-black hover:bg-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.3)] active:scale-[0.98]",
  secondary: "bg-white/[0.06] text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.1] hover:text-white active:scale-[0.98]",
  ghost: "text-zinc-400 hover:bg-white/[0.06] hover:text-white active:scale-[0.98]",
  gold: "gradient-gold text-black font-semibold shadow-[0_4px_15px_rgba(212,168,83,0.25)] hover:shadow-[0_6px_20px_rgba(212,168,83,0.35)] active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_1px_2px_rgba(220,38,38,0.3)] active:scale-[0.98]",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
