import { jsPDF } from "jspdf";
import type { DietPlan } from "@/types";
import type { WorkoutDay } from "./mock-data";
import { config } from "./config";

export function exportDietPlanPDF(plan: DietPlan, clientName: string) {
  const doc = new jsPDF();
  const gold = config.colors.primaryRgb;
  const dark = [20, 20, 20] as const;
  let y = 20;

  // Header
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...gold);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(config.brand.name, 15, 18);
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("Diet Plan", 15, 26);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(plan.title, 15, 35);
  y = 50;

  // Client info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Client: ${clientName}  |  Duration: ${plan.weeks} weeks  |  ${plan.startDate} to ${plan.endDate}`, 15, y);
  y += 12;

  // Daily totals
  const totalCal = plan.meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalP = plan.meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalC = plan.meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalF = plan.meals.reduce((s, m) => s + (m.fat || 0), 0);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, y, 180, 16, 3, 3, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Daily Totals:  ${totalCal} kcal  |  P: ${totalP}g  |  C: ${totalC}g  |  F: ${totalF}g`, 20, y + 10);
  y += 24;

  // Meals
  plan.meals.forEach((meal) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setTextColor(...gold);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`${meal.name}  —  ${meal.time}`, 15, y);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text(`${meal.calories || 0} kcal  |  P: ${meal.protein || 0}g  C: ${meal.carbs || 0}g  F: ${meal.fat || 0}g`, 15, y + 6);
    y += 12;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    meal.items.forEach((item) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(`•  ${item}`, 20, y);
      y += 6;
    });
    y += 6;
  });

  doc.save(`${plan.title.replace(/\s+/g, "_")}_diet_plan.pdf`);
}

export function exportWorkoutPlanPDF(title: string, clientName: string, days: WorkoutDay[]) {
  const doc = new jsPDF();
  const gold = config.colors.primaryRgb;
  const dark = [20, 20, 20] as const;
  let y = 20;

  // Header
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...gold);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(config.brand.name, 15, 18);
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("Workout Plan", 15, 26);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(title, 15, 35);
  y = 50;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Client: ${clientName}  |  ${days.length}-day split`, 15, y);
  y += 12;

  days.forEach((day) => {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(...gold);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`${day.dayLabel}: ${day.name}`, 15, y);
    y += 8;

    // Table header
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, y, 180, 8, 2, 2, "F");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Exercise", 20, y + 5.5);
    doc.text("Sets", 120, y + 5.5);
    doc.text("Reps", 140, y + 5.5);
    doc.text("Rest", 165, y + 5.5);
    y += 11;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    day.exercises.forEach((ex) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setTextColor(60, 60, 60);
      doc.text(ex.name, 20, y);
      doc.text(String(ex.sets), 122, y);
      doc.text(ex.reps, 142, y);
      doc.text(ex.rest, 167, y);
      y += 7;
    });
    y += 6;
  });

  doc.save(`${title.replace(/\s+/g, "_")}_workout.pdf`);
}
