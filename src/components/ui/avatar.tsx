import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
};

const colorPairs = [
  "bg-gold/15 text-gold ring-gold/20",
  "bg-sky-500/15 text-sky-400 ring-sky-500/20",
  "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  "bg-violet-500/15 text-violet-400 ring-violet-500/20",
  "bg-rose-500/15 text-rose-400 ring-rose-500/20",
  "bg-amber-500/15 text-amber-400 ring-amber-500/20",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPairs[Math.abs(hash) % colorPairs.length];
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-xl object-cover ring-1 ring-white/10", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold ring-1",
        sizeClasses[size],
        getColor(name),
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
