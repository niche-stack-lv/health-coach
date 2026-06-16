"use client";

import { Scale, Footprints, Dumbbell, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeightUnit } from "@/lib/units";

interface DailyPulseStripProps {
  /** Weight value as displayed in the chosen unit (string for typing) */
  weight: string;
  onWeightChange: (v: string) => void;
  weightUnit: WeightUnit;
  onWeightUnitChange: (u: WeightUnit) => void;
  steps: string;
  onStepsChange: (v: string) => void;
  weightTraining: "yes" | "no" | "rest" | "";
  onWeightTrainingChange: (v: "yes" | "no" | "rest") => void;
  mealsDecided: number;
  mealsTotal: number;
}

/**
 * Compact horizontal strip at the top of the daily check-in.
 * Captures the four highest-signal daily inputs in one row.
 */
export function DailyPulseStrip({
  weight,
  onWeightChange,
  weightUnit,
  onWeightUnitChange,
  steps,
  onStepsChange,
  weightTraining,
  onWeightTrainingChange,
  mealsDecided,
  mealsTotal,
}: DailyPulseStripProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Weight tile with unit toggle */}
        <div className="rounded-xl bg-white/[0.03] py-2 px-2.5">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <div className="flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wide">Weight</span>
            </div>
            <div className="flex items-center gap-0.5">
              {(["lbs", "kg"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onWeightUnitChange(u)}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
                    weightUnit === u
                      ? "bg-gold/15 text-gold"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="--"
            className="w-full bg-transparent text-base font-semibold text-white text-center focus:outline-none placeholder:text-zinc-600"
          />
        </div>

        <PulseTile
          icon={<Footprints className="h-3.5 w-3.5" />}
          label="Steps"
          input={
            <input
              type="number"
              value={steps}
              onChange={(e) => onStepsChange(e.target.value)}
              placeholder="--"
              className="w-full bg-transparent text-base font-semibold text-white text-center focus:outline-none placeholder:text-zinc-600"
            />
          }
        />
        <div className="rounded-xl bg-white/[0.03] py-2 px-2.5">
          <div className="flex items-center gap-1 text-zinc-500 mb-1">
            <Dumbbell className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide">Lifted?</span>
          </div>
          <div className="flex gap-1">
            {(["yes", "no", "rest"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onWeightTrainingChange(opt)}
                className={cn(
                  "flex-1 rounded-md py-1 text-[11px] font-medium border transition-colors capitalize",
                  weightTraining === opt
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <PulseTile
          icon={<Utensils className="h-3.5 w-3.5" />}
          label="Meals"
          readOnlyValue={`${mealsDecided}/${mealsTotal}`}
          highlight={mealsDecided === mealsTotal && mealsTotal > 0}
        />
      </div>
    </div>
  );
}

function PulseTile({
  icon,
  label,
  input,
  readOnlyValue,
  unit,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  input?: React.ReactNode;
  readOnlyValue?: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] py-2 px-2.5">
      <div className="flex items-center gap-1 text-zinc-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline justify-center gap-1">
        {input ? (
          <>
            {input}
            {unit && <span className="text-[10px] text-zinc-600">{unit}</span>}
          </>
        ) : (
          <p className={cn("text-base font-semibold", highlight ? "text-emerald-400" : "text-white")}>
            {readOnlyValue}
          </p>
        )}
      </div>
    </div>
  );
}
