# Patterns to follow

These are patterns extracted from the actual codebase — follow them for consistency.

## 1. Page Component with Suspense + Inner Component
All client-side pages that use `useSearchParams()` wrap the content in a Suspense boundary with an inner component to avoid Next.js hydration issues.

```tsx
export default function MyPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MyPageInner />
    </Suspense>
  );
}

function MyPageInner() {
  const isDemo = useIsDemo();
  // ...
}
```
Established in: `src/app/(coach)/coach/page.tsx`, `src/app/(client)/client/plan/page.tsx`, every client page.

## 2. Demo Mode Data Loading
Pages support a demo mode (`?demo=true`) by checking `useIsDemo()` in the `useEffect` and setting hardcoded state instead of fetching from Supabase.

```tsx
useEffect(() => {
  if (isDemo) {
    setData([/* hardcoded demo data */]);
    setLoading(false);
    return;
  }
  if (user) loadData();
}, [user, isDemo]);
```
Established in: every coach and client page.

## 3. DB Function Pattern
Database functions in `db.ts` follow a consistent shape: get the Supabase client, run the query, return data or error.

```tsx
// Read: return data || []
export async function getThings(id: string) {
  const sb = getSupabase();
  const { data } = await sb.from("things").select("*").eq("owner_id", id);
  return data || [];
}

// Write: return { error: string | null }
export async function createThing(thing: { ... }) {
  const sb = getSupabase();
  const { error } = await sb.from("things").insert(thing);
  return { error: error?.message || null };
}
```
Established in: `src/lib/db.ts` (all functions).

## 4. Input Styling
All form inputs use a consistent class string defined as a local constant.

```tsx
const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";
```
Established in: every page with forms.

## 5. Loading Spinner
Loading states use a consistent gold spinner pattern.

```tsx
if (loading) return (
  <div className="flex justify-center py-20">
    <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
  </div>
);
```
Established in: every data-fetching page.

## 6. Success State Pattern
After a successful create/update operation, pages show a success screen with a check icon and a "Back to X" button.

```tsx
if (saved) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-gold" />
      </div>
      <h1 className="text-xl font-bold text-white">Thing Created!</h1>
      <p className="text-sm text-zinc-500 mt-2">Description of what happened.</p>
      <Link href="/coach/things">
        <Button variant="gold" className="mt-6">Back to Things</Button>
      </Link>
    </div>
  );
}
```
Established in: `plans/create`, `workouts/create`, `check-in`, `plans/[id]`.

## 7. Bottom Sheet / Modal Pattern
Interactive pickers use a fixed bottom sheet with backdrop blur, stopPropagation on the content div.

```tsx
<div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
  <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] p-5 pb-8 safe-area-bottom"
    onClick={(e) => e.stopPropagation()}>
    {/* content */}
  </div>
</div>
```
Established in: `plans/create` (AmountSheet, CustomFoodSheet), `workouts/create` (ExerciseSheet).

## 8. Card-Based Layout
All content sections use the `<Card>` component. Lists use `space-y-3` with cards. Grids use `grid grid-cols-2 gap-3`.

```tsx
<div className="space-y-3">
  {items.map((item) => (
    <Card key={item.id} className="p-4">
      {/* content */}
    </Card>
  ))}
</div>
```
Established in: every list view.

## 9. Tab Navigation Pattern
In-page tabs use a flex row of buttons with gold active state.

```tsx
<div className="flex gap-2 mb-5">
  {(["tab1", "tab2"] as const).map((t) => (
    <button key={t} onClick={() => setTab(t)}
      className={cn("rounded-xl px-4 py-2 text-sm font-semibold border capitalize",
        tab === t ? "border-gold bg-gold/10 text-gold" : "border-white/[0.06] text-zinc-500"
      )}>{t}</button>
  ))}
</div>
```
Established in: `clients/page.tsx`, `clients/[id]/page.tsx`, `leads/page.tsx`.

## 10. Page Header Pattern
Every page starts with a header div containing title, subtitle, and optional action button.

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-xl lg:text-2xl font-bold text-white">Page Title</h1>
    <p className="text-zinc-500 mt-1 text-sm">Subtitle or count</p>
  </div>
  <Button variant="gold"><Plus className="h-4 w-4" /> Action</Button>
</div>
```
Established in: every coach page.

## 11. Sticky Bottom Action Bar
Multi-step forms and edit pages use a fixed bottom bar with glass effect.

```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/[0.06] safe-area-bottom">
  <div className="max-w-7xl mx-auto px-4 py-3">
    <Button variant="gold" className="w-full h-12 text-base rounded-2xl">
      <Check className="h-5 w-5" /> Save
    </Button>
  </div>
</div>
```
Established in: `plans/create`, `plans/[id]`, `workouts/create`, `workouts/edit`, `enquiry`.

## 12. Auth-Dependent Data Loading
Pages check `user` from `useAuth()` before loading data. The pattern is always `if (user) loadData()` in a useEffect.

```tsx
const { user } = useAuth();
useEffect(() => { if (user) loadData(); }, [user]);
```
Established in: every authenticated page.

## 13. `cn()` for Conditional Classes
All conditional class merging uses the `cn()` utility (clsx + tailwind-merge).

```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-classes", condition && "conditional-classes")} />
```
Established in: every component.

## 14. "use client" Directive
Every page and component that uses hooks, state, or browser APIs has `"use client"` at the top. Server components are the layouts only.

Established in: all interactive pages.

## 15. Supabase Join Syntax
Related data is fetched using Supabase's `select()` with foreign key joins.

```tsx
const { data } = await sb
  .from("diet_plans")
  .select("*, meals:diet_meals(*), client:profiles!diet_plans_client_id_fkey(name, email)")
  .eq("coach_id", coachId);
```
Established in: `src/lib/db.ts`.


## 16. Shared Components with Mode Props

When the same data structure is rendered in multiple contexts (coach edit, coach view, client view, client selection), use a SINGLE shared component with a `mode` prop instead of duplicating UI code.

**Location:** `src/components/shared/`

**Pattern:**
```tsx
// src/components/shared/meal-slot-view.tsx
import { MealSlotView } from "@/components/shared/meal-slot-view";

// Edit mode (template editor, plan creation):
<MealSlotView
  slot={localMealSlot}  // EditableMealSlot type
  mode="edit"
  allDishes={allDishes}
  onAddDish={(compIdx) => openPicker(slotIdx, compIdx)}
  onRemoveDish={(compIdx, dishId) => removeDish(slotIdx, compIdx, dishId)}
/>

// View mode (client diet plan):
<MealSlotView slot={templateMealSlot} mode="view" />

// Select mode (food check-in):
<MealSlotView
  slot={templateMealSlot}
  mode="select"
  selections={selections}
  isSlotSkipped={skippedSlots.has(slot.id)}
  onSelectDish={handleSelectDish}
  onSelectOther={(compId) => setSelections(...)}
  onSkipSlot={() => handleSkipSlot(slot.id, slot.components)}
/>

// src/components/shared/workout-slot-view.tsx
import { WorkoutSlotView } from "@/components/shared/workout-slot-view";

<WorkoutSlotView
  slot={localSlot}  // EditableWorkoutSlot type
  mode="edit"
  onAddExercise={() => setPickerSlotIdx(slotIdx)}
  onRemoveExercise={(exIdx) => removeExercise(slotIdx, exIdx)}
/>

// src/components/shared/macro-summary.tsx
import { MacroSummary } from "@/components/shared/macro-summary";

<MacroSummary calories={macros.calories} protein={macros.protein} carbs={macros.carbs} fat={macros.fat} />
<MacroSummary calories={total.calories} protein={total.protein} carbs={total.carbs} fat={total.fat} size="sm" />
```

**Visual design (chip/list style — shared across all modes):**
- Category labels: colored badges with `rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide` + category-specific colors
- Dish chips: `rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px]` with emoji + name + calories
- Edit mode adds: X button on chips + "+ Add Dish" dashed button
- View mode adds: "or" separator between alternatives
- Select mode: chips as buttons with gold highlight when selected + "Other" + "Skip" options

**Why:** Changing the visual design once automatically updates ALL pages. No more updating 4+ files for one design change.

**Rules:**
- One component per data structure (MealSlotView, WorkoutSlotView, MacroSummary)
- Mode determines behavior (editable, read-only, selectable)
- Visual design is shared — only interaction differs
- Props are optional based on mode (edit needs onAdd/onRemove, select needs selections/onSelect)
- Never duplicate rendering logic across pages — extract to shared component
- Edit mode accepts `EditableMealSlot` / `EditableWorkoutSlot` (local state types with `localId` + `dishIds`)
- View/select modes accept `TemplateMealSlot` / `WorkoutTemplateSlot` (DB types with `id` + nested `dishes`)

**Shared components (completed):**
- `src/components/shared/meal-slot-view.tsx` — renders meal slot in edit/view/select modes
- `src/components/shared/workout-slot-view.tsx` — renders workout slot in edit/view modes
- `src/components/shared/macro-summary.tsx` — renders macro totals (sm/md/lg sizes)
- `src/components/coach/food-picker.tsx` — food picker with category tabs + quantity sheet
- `src/components/coach/quantity-sheet.tsx` — gram amount selector
- `src/components/coach/dish-picker-modal.tsx` — dish picker filtered by category
- `src/components/coach/exercise-picker.tsx` — exercise picker with muscle group tabs

**Pages using shared components:**
- `src/app/(coach)/coach/diet-templates/[id]/page.tsx` → `<MealSlotView mode="edit" />`
- `src/app/(coach)/coach/plans/create/page.tsx` → `<MealSlotView mode="edit" />`
- `src/app/(client)/client/diet-plan/page.tsx` → `<MealSlotView mode="view" />`
- `src/app/(client)/client/food-check-in/page.tsx` → `<MealSlotView mode="select" />`
- `src/app/(coach)/coach/workout-templates/[id]/page.tsx` → `<WorkoutSlotView mode="edit" />`
- `src/app/(coach)/coach/workouts/create/page.tsx` → `<WorkoutSlotView mode="edit" />`
