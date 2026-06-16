/**
 * Weight unit conversion + display.
 *
 * Storage convention: weights are always saved as kg (numeric) in the DB.
 * Display convention: each user has a `weight_unit` preference ('kg' or 'lbs').
 * We only convert at the input/display boundary.
 */

export type WeightUnit = "kg" | "lbs";

export const KG_PER_LB = 0.45359237;

export function lbsToKg(lbs: number): number {
  return lbs * KG_PER_LB;
}

export function kgToLbs(kg: number): number {
  return kg / KG_PER_LB;
}

/** Convert a kg value (storage) to the user's display unit. */
export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === "kg" ? kg : kgToLbs(kg);
}

/** Convert an entered display value back to kg for storage. */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : lbsToKg(value);
}

/** Format a kg value for display, with unit label. */
export function formatWeight(kg: number | null | undefined, unit: WeightUnit, opts?: { decimals?: number }): string {
  if (kg == null) return "--";
  const decimals = opts?.decimals ?? 1;
  return `${fromKg(kg, unit).toFixed(decimals)} ${unit}`;
}
