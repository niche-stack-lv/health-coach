export interface Exercise {
  id: string;
  name: string;
  category: "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio";
  emoji: string;
  equipment?: string;
  videoId?: string; // YouTube video ID for demo
}

export const exerciseDatabase: Exercise[] = [
  // Chest
  { id: "e1", name: "Flat Bench Press", category: "chest", emoji: "🏋️", equipment: "Barbell" },
  { id: "e2", name: "Incline Dumbbell Press", category: "chest", emoji: "🏋️", equipment: "Dumbbells" },
  { id: "e3", name: "Cable Flyes", category: "chest", emoji: "🏋️", equipment: "Cable" },
  { id: "e4", name: "Dips (Chest)", category: "chest", emoji: "🏋️", equipment: "Bodyweight" },
  { id: "e5", name: "Pec Deck Machine", category: "chest", emoji: "🏋️", equipment: "Machine" },
  // Back
  { id: "e6", name: "Deadlift", category: "back", emoji: "💪", equipment: "Barbell" },
  { id: "e7", name: "Lat Pulldown", category: "back", emoji: "💪", equipment: "Cable" },
  { id: "e8", name: "Barbell Row", category: "back", emoji: "💪", equipment: "Barbell" },
  { id: "e9", name: "Seated Cable Row", category: "back", emoji: "💪", equipment: "Cable" },
  { id: "e10", name: "Pull-ups", category: "back", emoji: "💪", equipment: "Bodyweight" },
  // Shoulders
  { id: "e11", name: "Overhead Press", category: "shoulders", emoji: "🔥", equipment: "Barbell" },
  { id: "e12", name: "Lateral Raises", category: "shoulders", emoji: "🔥", equipment: "Dumbbells" },
  { id: "e13", name: "Face Pulls", category: "shoulders", emoji: "🔥", equipment: "Cable" },
  { id: "e14", name: "Front Raises", category: "shoulders", emoji: "🔥", equipment: "Dumbbells" },
  { id: "e15", name: "Rear Delt Flyes", category: "shoulders", emoji: "🔥", equipment: "Dumbbells" },
  // Arms
  { id: "e16", name: "Barbell Curl", category: "arms", emoji: "💪", equipment: "Barbell" },
  { id: "e17", name: "Hammer Curls", category: "arms", emoji: "💪", equipment: "Dumbbells" },
  { id: "e18", name: "Tricep Pushdown", category: "arms", emoji: "💪", equipment: "Cable" },
  { id: "e19", name: "Skull Crushers", category: "arms", emoji: "💪", equipment: "EZ Bar" },
  { id: "e20", name: "Preacher Curl", category: "arms", emoji: "💪", equipment: "Machine" },
  // Legs
  { id: "e21", name: "Barbell Squat", category: "legs", emoji: "🦵", equipment: "Barbell" },
  { id: "e22", name: "Leg Press", category: "legs", emoji: "🦵", equipment: "Machine" },
  { id: "e23", name: "Romanian Deadlift", category: "legs", emoji: "🦵", equipment: "Barbell" },
  { id: "e24", name: "Leg Extension", category: "legs", emoji: "🦵", equipment: "Machine" },
  { id: "e25", name: "Leg Curl", category: "legs", emoji: "🦵", equipment: "Machine" },
  { id: "e26", name: "Calf Raises", category: "legs", emoji: "🦵", equipment: "Machine" },
  { id: "e27", name: "Bulgarian Split Squat", category: "legs", emoji: "🦵", equipment: "Dumbbells" },
  // Core
  { id: "e28", name: "Hanging Leg Raise", category: "core", emoji: "🎯", equipment: "Bodyweight" },
  { id: "e29", name: "Cable Crunch", category: "core", emoji: "🎯", equipment: "Cable" },
  { id: "e30", name: "Plank", category: "core", emoji: "🎯", equipment: "Bodyweight" },
  // Cardio
  { id: "e31", name: "Treadmill Walk", category: "cardio", emoji: "🏃", equipment: "Treadmill" },
  { id: "e32", name: "Stairmaster", category: "cardio", emoji: "🏃", equipment: "Machine" },
  { id: "e33", name: "Cycling", category: "cardio", emoji: "🏃", equipment: "Bike" },
];

export const muscleGroups = [
  { key: "chest" as const, label: "Chest", emoji: "🏋️" },
  { key: "back" as const, label: "Back", emoji: "💪" },
  { key: "shoulders" as const, label: "Shoulders", emoji: "🔥" },
  { key: "arms" as const, label: "Arms", emoji: "💪" },
  { key: "legs" as const, label: "Legs", emoji: "🦵" },
  { key: "core" as const, label: "Core", emoji: "🎯" },
  { key: "cardio" as const, label: "Cardio", emoji: "🏃" },
];

export const workoutDays = [
  { id: "day1", label: "Day 1", name: "Push" },
  { id: "day2", label: "Day 2", name: "Pull" },
  { id: "day3", label: "Day 3", name: "Legs" },
  { id: "day4", label: "Day 4", name: "Upper" },
  { id: "day5", label: "Day 5", name: "Lower" },
  { id: "day6", label: "Day 6", name: "Arms & Abs" },
] as const;
