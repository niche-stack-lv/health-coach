"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "./supabase";
import { useAuth } from "./auth-context";
import type { WeightUnit } from "./units";

/**
 * Read & update the current user's preferred weight unit.
 * Defaults to 'lbs' if no preference is set.
 */
export function useWeightUnit() {
  const { user } = useAuth();
  const [unit, setUnitState] = useState<WeightUnit>("lbs");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnitState("lbs");
      setLoaded(true);
      return;
    }
    const sb = getSupabase();
    sb.from("profiles")
      .select("weight_unit")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const u = (data?.weight_unit as WeightUnit | undefined) || "lbs";
        setUnitState(u);
        setLoaded(true);
      });
  }, [user]);

  const setUnit = useCallback(
    async (next: WeightUnit) => {
      setUnitState(next);
      if (!user) return;
      const sb = getSupabase();
      await sb.from("profiles").update({ weight_unit: next }).eq("id", user.id);
    },
    [user]
  );

  return { unit, setUnit, loaded };
}
