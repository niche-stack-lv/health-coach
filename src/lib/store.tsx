"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { mockDietPlans, mockWorkoutPlan, mockMeasurements, mockHabits, type WorkoutDay, type BodyMeasurement, type Habit, type HabitLog } from "./mock-data";
import type { DietPlan } from "@/types";

export interface StoredWorkoutPlan {
  id: string;
  title: string;
  clientId: string;
  status: "active" | "draft";
  days: WorkoutDay[];
}

interface AppStore {
  dietPlans: DietPlan[];
  addDietPlan: (plan: DietPlan) => void;
  workoutPlans: StoredWorkoutPlan[];
  addWorkoutPlan: (plan: StoredWorkoutPlan) => void;
  measurements: Record<string, BodyMeasurement[]>;
  addMeasurement: (clientId: string, entry: BodyMeasurement) => void;
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  habitLogs: HabitLog[];
  toggleHabitLog: (date: string, habitId: string) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(mockDietPlans);
  const [workoutPlans, setWorkoutPlans] = useState<StoredWorkoutPlan[]>([
    { id: "wp1", title: mockWorkoutPlan.title, clientId: mockWorkoutPlan.clientId, status: "active", days: mockWorkoutPlan.days },
  ]);
  const [measurements, setMeasurements] = useState<Record<string, BodyMeasurement[]>>(mockMeasurements);
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  const addDietPlan = (plan: DietPlan) => setDietPlans((prev) => [...prev, plan]);
  const addWorkoutPlan = (plan: StoredWorkoutPlan) => setWorkoutPlans((prev) => [...prev, plan]);
  const addMeasurement = (clientId: string, entry: BodyMeasurement) => {
    setMeasurements((prev) => ({ ...prev, [clientId]: [...(prev[clientId] || []), entry] }));
  };
  const addHabit = (habit: Habit) => setHabits((prev) => [...prev, habit]);
  const removeHabit = (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id));
  const toggleHabitLog = (date: string, habitId: string) => {
    setHabitLogs((prev) => {
      const existing = prev.find((l) => l.date === date && l.habitId === habitId);
      if (existing) return prev.map((l) => l.date === date && l.habitId === habitId ? { ...l, completed: !l.completed } : l);
      return [...prev, { date, habitId, completed: true }];
    });
  };

  return (
    <StoreContext.Provider value={{ dietPlans, addDietPlan, workoutPlans, addWorkoutPlan, measurements, addMeasurement, habits, addHabit, removeHabit, habitLogs, toggleHabitLog }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
