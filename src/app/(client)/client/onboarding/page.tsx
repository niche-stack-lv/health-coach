"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { saveOnboarding } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";
const textareaClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50 min-h-[80px] resize-none";

// Multi-select chip component with "Other" option
function ChipSelect({ options, selected, onChange, columns = 2 }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; columns?: number }) {
  const [otherInput, setOtherInput] = useState("");
  const customItems = selected.filter(s => !options.includes(s));

  function addOther() {
    const trimmed = otherInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setOtherInput("");
    }
  }

  return (
    <div className="space-y-2">
      <div className={cn("grid gap-2", columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : "grid-cols-2")}>
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
            className={cn("rounded-xl py-2.5 px-3 text-xs font-medium border transition-all text-left",
              selected.includes(opt) ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400 active:bg-white/[0.04]"
            )}>{opt}</button>
        ))}
      </div>
      {/* Custom items */}
      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customItems.map(item => (
            <span key={item} className="inline-flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-2 py-1 text-xs text-gold">
              {item}
              <button type="button" onClick={() => onChange(selected.filter(s => s !== item))} className="text-gold/60 hover:text-gold">×</button>
            </span>
          ))}
        </div>
      )}
      {/* Add other */}
      <div className="flex gap-2">
        <input
          value={otherInput}
          onChange={e => setOtherInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOther(); } }}
          placeholder="Other (type & press Enter)"
          className="flex-1 rounded-xl border border-dashed border-white/[0.1] bg-transparent py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/30"
        />
        {otherInput.trim() && (
          <button type="button" onClick={addOther} className="text-xs text-gold font-medium px-2">Add</button>
        )}
      </div>
    </div>
  );
}

// Single-select chip component with "Other" option
function RadioSelect({ options, value, onChange, columns = 2 }: { options: string[]; value: string; onChange: (v: string) => void; columns?: number }) {
  const [showOther, setShowOther] = useState(false);
  const [otherInput, setOtherInput] = useState("");
  const isCustom = value && !options.includes(value);

  return (
    <div className="space-y-2">
      <div className={cn("grid gap-2", columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : "grid-cols-2")}>
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => { onChange(opt); setShowOther(false); }}
            className={cn("rounded-xl py-2.5 px-3 text-xs font-medium border transition-all text-left",
              value === opt ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-400 active:bg-white/[0.04]"
            )}>{opt}</button>
        ))}
        <button type="button" onClick={() => setShowOther(true)}
          className={cn("rounded-xl py-2.5 px-3 text-xs font-medium border transition-all text-left",
            (showOther || isCustom) ? "border-gold bg-gold/10 text-gold" : "border-dashed border-white/[0.1] text-zinc-500 active:bg-white/[0.04]"
          )}>Other</button>
      </div>
      {(showOther || isCustom) && (
        <input
          value={isCustom ? value : otherInput}
          onChange={e => { setOtherInput(e.target.value); onChange(e.target.value); }}
          placeholder="Please specify..."
          className="w-full rounded-xl border border-gold/20 bg-transparent py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/40"
          autoFocus
        />
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Form state — all fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [city, setCity] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [gymAccess, setGymAccess] = useState("");
  const [workType, setWorkType] = useState("");
  const [dietType, setDietType] = useState("");
  const [proteinPrefs, setProteinPrefs] = useState<string[]>([]);
  const [vegProteins, setVegProteins] = useState<string[]>([]);
  const [dals, setDals] = useState<string[]>([]);
  const [vegetables, setVegetables] = useState<string[]>([]);
  const [carbSources, setCarbSources] = useState<string[]>([]);
  const [fruits, setFruits] = useState<string[]>([]);
  const [snackPref, setSnackPref] = useState("");
  const [openYogurt, setOpenYogurt] = useState("");
  const [openShakes, setOpenShakes] = useState("");
  const [openBars, setOpenBars] = useState("");
  const [chaiCoffee, setChaiCoffee] = useState("");
  const [foodAllergies, setFoodAllergies] = useState("");
  const [cravings, setCravings] = useState<string[]>([]);
  const [alcohol, setAlcohol] = useState("");
  const [mealsOut, setMealsOut] = useState("");
  const [fastFood, setFastFood] = useState<string[]>([]);
  const [breakfastPerson, setBreakfastPerson] = useState("");
  const [vacationPlans, setVacationPlans] = useState("");
  const [weightHistory, setWeightHistory] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [dayStructure, setDayStructure] = useState("");
  const [weekendRoutine, setWeekendRoutine] = useState("");
  const [lastMealSleep, setLastMealSleep] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [coachingStyle, setCoachingStyle] = useState<string[]>([]);
  const [biggestStruggle, setBiggestStruggle] = useState("");
  const [dailySteps, setDailySteps] = useState("");
  const [cookingComfort, setCookingComfort] = useState("");
  const [urgency, setUrgency] = useState("");

  const totalSteps = 7;
  const stepLabels = ["Profile", "Goals", "Lifestyle", "Diet Type", "Food Prefs", "Habits", "About You"];

  async function handleSubmit() {
    if (!user) return;
    setSaving(true);
    await saveOnboarding({
      client_id: user.id,
      primary_goal: fitnessGoal,
      target_weight: targetWeight ? Number(targetWeight) : undefined,
      age: age ? Number(age) : undefined,
      height,
      current_weight: currentWeight ? Number(currentWeight) : undefined,
      weight_history: weightHistory,
      work_type: workType,
      medical_conditions: medicalConditions,
      notes: additionalNotes,
      city,
      gym_access: gymAccess,
      diet_type: dietType,
      protein_preferences: proteinPrefs,
      veg_proteins: vegProteins,
      dals,
      vegetables,
      carb_sources: carbSources,
      fruits,
      snack_preference: snackPref,
      open_to_yogurt: openYogurt,
      open_to_shakes: openShakes,
      open_to_bars: openBars,
      chai_coffee: chaiCoffee,
      food_allergies: foodAllergies,
      cravings,
      alcohol,
      meals_out: mealsOut,
      fast_food: fastFood,
      breakfast_person: breakfastPerson,
      vacation_plans: vacationPlans,
      day_structure: dayStructure,
      weekend_routine: weekendRoutine,
      last_meal_sleep: lastMealSleep,
      energy_level: energyLevel,
      coaching_style: coachingStyle.join(", "),
      biggest_struggle: biggestStruggle,
      daily_steps: dailySteps,
      cooking_comfort: cookingComfort,
      urgency,
    });
    // Mark onboarding as completed
    const { getSupabase } = await import("@/lib/supabase");
    await getSupabase().from("clients").update({ onboarding_completed: true }).eq("id", user.id);
    setSaving(false);
    setDone(true);
    setTimeout(() => { window.location.href = "/client"; }, 2000);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <h1 className="text-xl font-bold text-white">You&apos;re All Set!</h1>
        <p className="text-sm text-zinc-500 mt-2">Your coach will review your info and build your personalized plan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 sm:py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">Let&apos;s Get to Know You</h1>
          <p className="text-sm text-zinc-500 mt-1">Step {step + 1} of {totalSteps}: {stepLabels[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-gold" : "bg-white/[0.06]")} />
          ))}
        </div>

        {/* Step 0: Demographics */}
        {step === 0 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Demographic Profile</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="28" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Height</label>
                <input value={height} onChange={e => setHeight(e.target.value)} placeholder="5'8&quot; or 173cm" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Dallas, TX" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Current weight (lbs or kg)</label>
              <input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} placeholder="165" className={inputClass} />
            </div>
          </Card>
        )}

        {/* Step 1: Fitness Goals */}
        {step === 1 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Fitness Goals</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">What are your specific fitness goals?</label>
              <RadioSelect options={["Fat loss", "Muscle gain", "Both"]} value={fitnessGoal} onChange={setFitnessGoal} columns={3} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Goal weight (keep same if muscle gain)</label>
              <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} placeholder="150" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Medical conditions or dietary restrictions?</label>
              <textarea value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)} placeholder="Thyroid, diabetes, knee pain, none..." className={textareaClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Gym access</label>
              <input value={gymAccess} onChange={e => setGymAccess(e.target.value)} placeholder="LA Fitness, apartment gym, etc." className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Work situation</label>
              <RadioSelect options={["Work from home", "Work onsite", "Hybrid", "Stay at home", "Student"]} value={workType} onChange={setWorkType} columns={2} />
            </div>
          </Card>
        )}

        {/* Step 2: Lifestyle */}
        {step === 2 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Lifestyle & Routine</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">What does a typical weekday look like?</label>
              <textarea value={dayStructure} onChange={e => setDayStructure(e.target.value)} placeholder="Wake up, meals, work, gym, sleep times..." className={textareaClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">How are weekends different?</label>
              <textarea value={weekendRoutine} onChange={e => setWeekendRoutine(e.target.value)} placeholder="Eating out, social events, sleeping in..." className={textareaClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Last meal time & bedtime?</label>
              <input value={lastMealSleep} onChange={e => setLastMealSleep(e.target.value)} placeholder="Last meal 8pm, bed by 11pm" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Energy level during the day?</label>
              <RadioSelect options={["Low", "Medium", "High"]} value={energyLevel} onChange={setEnergyLevel} columns={3} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Daily steps (average)?</label>
              <RadioSelect options={["<3k", "3–6k", "6–10k", "10k+"]} value={dailySteps} onChange={setDailySteps} columns={4} />
            </div>
          </Card>
        )}

        {/* Step 3: Diet Type */}
        {step === 3 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Dietary Profile</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Are you a...</label>
              <RadioSelect options={["Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian"]} value={dietType} onChange={setDietType} />
            </div>
            {(dietType === "Non-vegetarian" || dietType === "Eggetarian") && (
              <div>
                <label className="block text-xs text-zinc-400 mb-2">High protein foods you enjoy (non-veg)</label>
                <ChipSelect options={["Chicken breast", "Ground Turkey", "Egg curry", "Salmon", "Tilapia/Cod", "Shrimp"]} selected={proteinPrefs} onChange={setProteinPrefs} columns={2} />
              </div>
            )}
            <div>
              <label className="block text-xs text-zinc-400 mb-2">High protein curries you enjoy (veg)</label>
              <ChipSelect options={["Paneer", "Tofu", "Soy chunks curry", "Rajma", "Chole"]} selected={vegProteins} onChange={setVegProteins} columns={2} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Dals you enjoy</label>
              <ChipSelect options={["Toor dal", "Moong dal", "Masoor dal", "Chana dal"]} selected={dals} onChange={setDals} columns={2} />
            </div>
          </Card>
        )}

        {/* Step 4: Food Preferences */}
        {step === 4 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Food Preferences</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Vegetables you eat weekly</label>
              <ChipSelect options={["Potatoes", "Okra", "Cauliflower", "Ridgegourd", "Bottlegourd", "Tindora", "Cabbage", "Brinjal"]} selected={vegetables} onChange={setVegetables} columns={2} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Carbohydrate sources you eat weekly</label>
              <ChipSelect options={["White Rice", "Brown Rice", "Quinoa", "Roti/Chapati"]} selected={carbSources} onChange={setCarbSources} columns={2} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Fruits you enjoy (pick 5)</label>
              <ChipSelect options={["Apples", "Oranges", "Strawberries", "Blueberries", "Bananas", "Watermelon", "Cantaloupe", "Pears", "Peaches", "Kiwi", "Pineapple"]} selected={fruits} onChange={setFruits} columns={3} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Snack preference?</label>
              <RadioSelect options={["Sweet tooth", "Savory snacks"]} value={snackPref} onChange={setSnackPref} />
            </div>
          </Card>
        )}

        {/* Step 5: Habits & Supplements */}
        {step === 5 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Habits & Preferences</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Open to trying Greek yogurt?</label>
              <RadioSelect options={["Sure, recommend some", "No, I hate them"]} value={openYogurt} onChange={setOpenYogurt} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Open to protein shakes?</label>
              <RadioSelect options={["Sure, recommend some", "No, I hate them"]} value={openShakes} onChange={setOpenShakes} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Open to protein bars?</label>
              <RadioSelect options={["Sure, recommend some", "No, I hate them"]} value={openBars} onChange={setOpenBars} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Chai/Coffee relationship?</label>
              <RadioSelect options={["2+ cups daily", "Need 1 cup/day", "Can avoid", "Not into it"]} value={chaiCoffee} onChange={setChaiCoffee} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Food allergies or intolerances?</label>
              <input value={foodAllergies} onChange={e => setFoodAllergies(e.target.value)} placeholder="Lactose, gluten, none..." className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Cravings?</label>
              <ChipSelect options={["Biryani", "Wings", "Pizza", "Chips/Haldirams", "Indian sweets"]} selected={cravings} onChange={setCravings} columns={2} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Alcohol consumption?</label>
              <RadioSelect options={["No", "1-2 drinks/week", "1-2 drinks/day"]} value={alcohol} onChange={setAlcohol} columns={3} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Meals eaten out per week?</label>
              <RadioSelect options={["1-2", "2-4", "4-6", "All meals"]} value={mealsOut} onChange={setMealsOut} columns={4} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Go-to fast food places?</label>
              <ChipSelect options={["Chipotle", "Chick-fil-A", "Subway", "McDonalds", "Panera Bread"]} selected={fastFood} onChange={setFastFood} columns={2} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Breakfast person?</label>
              <RadioSelect options={["Need breakfast", "Can do Intermittent Fasting"]} value={breakfastPerson} onChange={setBreakfastPerson} columns={2} />
            </div>
          </Card>
        )}

        {/* Step 6: About You */}
        {step === 6 && (
          <Card className="!p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">About You</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Weight history (since age 22)</label>
              <textarea value={weightHistory} onChange={e => setWeightHistory(e.target.value)} placeholder="Describe your weight journey..." className={textareaClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">What coaching style works best? (select all that apply)</label>
              <ChipSelect options={["Strict accountability", "Flexible guidance", "Just a clear plan"]} selected={coachingStyle} onChange={setCoachingStyle} columns={3} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Biggest reason you haven&apos;t achieved your goal yet?</label>
              <textarea value={biggestStruggle} onChange={e => setBiggestStruggle(e.target.value)} placeholder="Be honest — this helps your coach help you..." className={textareaClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2">Cooking comfort?</label>
              <RadioSelect options={["Cook regularly", "Cook occasionally", "Mostly outside food"]} value={cookingComfort} onChange={setCookingComfort} columns={3} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Why do you want to achieve this goal now?</label>
              <textarea value={urgency} onChange={e => setUrgency(e.target.value)} placeholder="Marriage, event, health scare, just ready..." className={textareaClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Vacation/holiday plans (in next 6 months)?</label>
              <input value={vacationPlans} onChange={e => setVacationPlans(e.target.value)} placeholder="Any upcoming trips or events?" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Anything else your coach should know?</label>
              <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="Medical history, unique cravings, past diet history..." className={textareaClass} />
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}

          {step < totalSteps - 1 ? (
            <Button variant="gold" onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gold" onClick={handleSubmit} disabled={saving}>
              {saving ? "Submitting..." : "Submit"} <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
