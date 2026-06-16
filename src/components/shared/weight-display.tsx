"use client";

import { useWeightUnit } from "@/lib/use-weight-unit";
import { formatWeight } from "@/lib/units";

interface WeightDisplayProps {
  /** Weight value as stored in the DB (kg). */
  kg: number | null | undefined;
  /** Number of decimals to display. Defaults to 1. */
  decimals?: number;
  /** When true, returns just the formatted string with no fallback. */
  raw?: boolean;
  /** Fallback rendered when kg is null/undefined. Defaults to "—". */
  fallback?: string;
}

/**
 * Small helper for showing a weight value in the user's preferred unit.
 * Storage is always kg; this component reads the user's `weight_unit` and
 * converts on the fly.
 */
export function WeightDisplay({ kg, decimals = 1, fallback = "—" }: WeightDisplayProps) {
  const { unit } = useWeightUnit();
  if (kg == null) return <>{fallback}</>;
  return <>{formatWeight(kg, unit, { decimals })}</>;
}
