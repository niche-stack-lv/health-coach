export type UserRole = "coach" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Client extends User {
  role: "client";
  coachId: string;
  status: "active" | "inactive";
  goal: string;
  startDate: string;
  currentWeight?: number;
  targetWeight?: number;
}

export interface DietPlan {
  id: string;
  coachId: string;
  clientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  weeks: number;
  meals: Meal[];
  status: "active" | "completed" | "draft";
  createdAt: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface CheckIn {
  id: string;
  clientId: string;
  planId: string;
  date: string;
  week: number;
  photos: Photo[];
  weight?: number;
  notes?: string;
  coachFeedback?: string;
  status: "pending" | "reviewed";
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  type: "front" | "side" | "back";
  uploadedAt: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}
