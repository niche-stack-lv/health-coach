import { Client, DietPlan, CheckIn } from "@/types";

export const mockClients: Client[] = [
  {
    id: "c1",
    name: "Alex Rivera",
    email: "alex@example.com",
    role: "client",
    coachId: "coach1",
    status: "active",
    goal: "Lose 10kg and build lean muscle",
    startDate: "2026-03-01",
    currentWeight: 85,
    targetWeight: 75,
    createdAt: "2026-03-01",
  },
  {
    id: "c2",
    name: "Jordan Smith",
    email: "jordan@example.com",
    role: "client",
    coachId: "coach1",
    status: "active",
    goal: "Body recomposition",
    startDate: "2026-03-08",
    currentWeight: 72,
    targetWeight: 70,
    createdAt: "2026-03-08",
  },
  {
    id: "c3",
    name: "Sam Patel",
    email: "sam@example.com",
    role: "client",
    coachId: "coach1",
    status: "active",
    goal: "Gain muscle mass",
    startDate: "2026-02-15",
    currentWeight: 68,
    targetWeight: 78,
    createdAt: "2026-02-15",
  },
  {
    id: "c4",
    name: "Morgan Lee",
    email: "morgan@example.com",
    role: "client",
    coachId: "coach1",
    status: "inactive",
    goal: "General fitness",
    startDate: "2026-01-10",
    currentWeight: 90,
    targetWeight: 80,
    createdAt: "2026-01-10",
  },
  {
    id: "c5",
    name: "Taylor Chen",
    email: "taylor@example.com",
    role: "client",
    coachId: "coach1",
    status: "active",
    goal: "Prepare for competition",
    startDate: "2026-03-15",
    currentWeight: 77,
    targetWeight: 73,
    createdAt: "2026-03-15",
  },
];

export const mockDietPlans: DietPlan[] = [
  {
    id: "dp1",
    coachId: "coach1",
    clientId: "c1",
    title: "Fat Loss Phase 1",
    description: "Caloric deficit with high protein to preserve muscle mass",
    startDate: "2026-03-01",
    endDate: "2026-03-28",
    weeks: 4,
    meals: [
      { id: "m1", name: "Breakfast", time: "7:00 AM", items: ["4 egg whites + 1 whole egg", "Oatmeal 50g", "Banana"], calories: 380, protein: 30, carbs: 45, fat: 8 },
      { id: "m2", name: "Lunch", time: "12:30 PM", items: ["Grilled chicken breast 200g", "Brown rice 150g", "Mixed salad"], calories: 520, protein: 45, carbs: 50, fat: 12 },
      { id: "m3", name: "Snack", time: "4:00 PM", items: ["Greek yogurt 200g", "Almonds 20g", "Apple"], calories: 280, protein: 20, carbs: 25, fat: 10 },
      { id: "m4", name: "Dinner", time: "7:30 PM", items: ["Salmon fillet 180g", "Sweet potato 150g", "Steamed broccoli"], calories: 480, protein: 38, carbs: 35, fat: 18 },
    ],
    status: "active",
    createdAt: "2026-02-28",
  },
  {
    id: "dp2",
    coachId: "coach1",
    clientId: "c2",
    title: "Recomp Plan",
    description: "Maintenance calories with macro cycling",
    startDate: "2026-03-08",
    endDate: "2026-03-29",
    weeks: 3,
    meals: [
      { id: "m5", name: "Breakfast", time: "8:00 AM", items: ["Protein smoothie", "PB toast"], calories: 420, protein: 35, carbs: 40, fat: 14 },
      { id: "m6", name: "Lunch", time: "1:00 PM", items: ["Turkey wrap", "Side salad", "Hummus"], calories: 550, protein: 40, carbs: 48, fat: 16 },
      { id: "m7", name: "Dinner", time: "7:00 PM", items: ["Lean beef stir fry", "Jasmine rice", "Vegetables"], calories: 580, protein: 42, carbs: 52
, fat: 18 },
    ],
    status: "active",
    createdAt: "2026-03-07",
  },
];

export const mockCheckIns: CheckIn[] = [
  {
    id: "ci1",
    clientId: "c1",
    planId: "dp1",
    date: "2026-03-07",
    week: 1,
    photos: [
      { id: "p1", url: "/placeholder-front.jpg", type: "front", uploadedAt: "2026-03-07T10:00:00Z" },
      { id: "p2", url: "/placeholder-side.jpg", type: "side", uploadedAt: "2026-03-07T10:00:00Z" },
    ],
    weight: 84.5,
    notes: "Feeling good, energy levels are stable. Stuck to the plan all week.",
    coachFeedback: "Great first week! Weight is trending down nicely. Keep it up.",
    status: "reviewed",
    createdAt: "2026-03-07T10:00:00Z",
  },
  {
    id: "ci2",
    clientId: "c1",
    planId: "dp1",
    date: "2026-03-14",
    week: 2,
    photos: [
      { id: "p3", url: "/placeholder-front.jpg", type: "front", uploadedAt: "2026-03-14T09:30:00Z" },
      { id: "p4", url: "/placeholder-side.jpg", type: "side", uploadedAt: "2026-03-14T09:30:00Z" },
    ],
    weight: 83.8,
    notes: "Had some cravings mid-week but managed to stay on track.",
    status: "pending",
    createdAt: "2026-03-14T09:30:00Z",
  },
  {
    id: "ci3",
    clientId: "c2",
    planId: "dp2",
    date: "2026-03-14",
    week: 1,
    photos: [
      { id: "p5", url: "/placeholder-front.jpg", type: "front", uploadedAt: "2026-03-14T11:00:00Z" },
    ],
    weight: 71.8,
    notes: "Adjusting to the new meal timing.",
    status: "pending",
    createdAt: "2026-03-14T11:00:00Z",
  },
  {
    id: "ci4",
    clientId: "c3",
    planId: "dp1",
    date: "2026-03-28",
    week: 3,
    photos: [],
    weight: 69.2,
    status: "pending",
    createdAt: "2026-03-28T08:00:00Z",
  },
];

export const mockWeightHistory: Record<string, { date: string; weight: number }[]> = {
  c1: [
    { date: "2026-03-01", weight: 85.0 },
    { date: "2026-03-07", weight: 84.5 },
    { date: "2026-03-14", weight: 83.8 },
    { date: "2026-03-21", weight: 83.2 },
    { date: "2026-03-28", weight: 82.6 },
  ],
  c2: [
    { date: "2026-03-08", weight: 72.0 },
    { date: "2026-03-14", weight: 71.8 },
    { date: "2026-03-21", weight: 71.5 },
    { date: "2026-03-28", weight: 71.2 },
  ],
  c3: [
    { date: "2026-02-15", weight: 68.0 },
    { date: "2026-02-21", weight: 68.4 },
    { date: "2026-02-28", weight: 68.9 },
    { date: "2026-03-07", weight: 69.2 },
    { date: "2026-03-14", weight: 69.8 },
    { date: "2026-03-21", weight: 70.3 },
    { date: "2026-03-28", weight: 70.9 },
  ],
  c5: [
    { date: "2026-03-15", weight: 77.0 },
    { date: "2026-03-21", weight: 76.4 },
    { date: "2026-03-28", weight: 75.8 },
  ],
};

export const mockComplianceData = [
  { week: "W1", compliance: 92 },
  { week: "W2", compliance: 88 },
  { week: "W3", compliance: 95 },
  { week: "W4", compliance: 87 },
  { week: "W5", compliance: 90 },
  { week: "W6", compliance: 85 },
];

export const mockRevenueData = [
  { month: "Oct", revenue: 45000, clients: 8 },
  { month: "Nov", revenue: 52000, clients: 10 },
  { month: "Dec", revenue: 48000, clients: 9 },
  { month: "Jan", revenue: 61000, clients: 12 },
  { month: "Feb", revenue: 58000, clients: 11 },
  { month: "Mar", revenue: 72000, clients: 14 },
];

export interface WorkoutExercise {
  name: string;
  emoji: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  dayLabel: string;
  name: string;
  exercises: WorkoutExercise[];
}

export const mockWorkoutPlan: { title: string; clientId: string; days: WorkoutDay[] } = {
  title: "PPL Hypertrophy Split",
  clientId: "c1",
  days: [
    {
      dayLabel: "Day 1", name: "Push",
      exercises: [
        { name: "Flat Bench Press", emoji: "🏋️", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Incline Dumbbell Press", emoji: "🏋️", sets: 3, reps: "10-12", rest: "75s" },
        { name: "Cable Flyes", emoji: "🏋️", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Overhead Press", emoji: "🔥", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Lateral Raises", emoji: "🔥", sets: 4, reps: "15-20", rest: "45s" },
        { name: "Tricep Pushdown", emoji: "💪", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    {
      dayLabel: "Day 2", name: "Pull",
      exercises: [
        { name: "Deadlift", emoji: "💪", sets: 4, reps: "5-6", rest: "120s", notes: "Focus on form" },
        { name: "Lat Pulldown", emoji: "💪", sets: 4, reps: "10-12", rest: "75s" },
        { name: "Barbell Row", emoji: "💪", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Face Pulls", emoji: "🔥", sets: 3, reps: "15-20", rest: "45s" },
        { name: "Barbell Curl", emoji: "💪", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Hammer Curls", emoji: "💪", sets: 3, reps: "12-15", rest: "45s" },
      ],
    },
    {
      dayLabel: "Day 3", name: "Legs",
      exercises: [
        { name: "Barbell Squat", emoji: "🦵", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Leg Press", emoji: "🦵", sets: 4, reps: "10-12", rest: "90s" },
        { name: "Romanian Deadlift", emoji: "🦵", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Leg Extension", emoji: "🦵", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Leg Curl", emoji: "🦵", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Calf Raises", emoji: "🦵", sets: 4, reps: "15-20", rest: "45s" },
      ],
    },
  ],
};

export interface BodyMeasurement {
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export const mockMeasurements: Record<string, BodyMeasurement[]> = {
  c1: [
    { date: "2026-03-01", weight: 85.0, bodyFat: 18, chest: 104, waist: 86, hips: 98, arms: 38, thighs: 60 },
    { date: "2026-03-07", weight: 84.5, bodyFat: 17.5, chest: 104, waist: 85, hips: 97, arms: 38, thighs: 60 },
    { date: "2026-03-14", weight: 83.8, bodyFat: 17, chest: 103.5, waist: 84, hips: 97, arms: 37.5, thighs: 59.5 },
    { date: "2026-03-21", weight: 83.2, bodyFat: 16.5, chest: 103, waist: 83, hips: 96.5, arms: 37.5, thighs: 59 },
    { date: "2026-03-28", weight: 82.6, bodyFat: 16, chest: 103, waist: 82, hips: 96, arms: 37, thighs: 59 },
  ],
};

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  target: string;
}

export interface HabitLog {
  date: string;
  habitId: string;
  completed: boolean;
}

export const mockHabits: Habit[] = [
  { id: "h1", name: "Drink Water", emoji: "💧", target: "3L per day" },
  { id: "h2", name: "Sleep", emoji: "😴", target: "8 hours" },
  { id: "h3", name: "Take Creatine", emoji: "💊", target: "5g daily" },
  { id: "h4", name: "10k Steps", emoji: "🚶", target: "Daily" },
  { id: "h5", name: "No Sugar", emoji: "🚫", target: "Zero added sugar" },
];
