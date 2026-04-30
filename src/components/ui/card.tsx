import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, glass, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-[#141414] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        hover && "transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,168,83,0.06)] hover:border-gold/20 hover:-translate-y-0.5 cursor-pointer",
        glass && "bg-white/[0.03] backdrop-blur-xl border-white/[0.06]",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold tracking-tight text-white", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-zinc-400 mt-1 leading-relaxed", className)}>{children}</p>;
}
