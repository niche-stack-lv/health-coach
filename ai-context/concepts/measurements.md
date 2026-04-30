# Body Measurements

## What it does
Clients log body measurements (weight, body fat %, chest, waist, hips, arms, thighs) over time. The data is displayed as cards showing latest values and line charts showing trends.

## How it works (step by step)
1. Client navigates to `/client/measurements`.
2. Client clicks "Log" to open the measurement form.
3. Client enters values for any combination of the 7 fields.
4. On save: `addMeasurement()` inserts a row into the `measurements` table.
5. The page shows: latest values as cards, weight/body fat trend chart, and a history list.
6. Coach can view a client's measurements at `/coach/clients/[id]` (measurements tab) with the same charts.

## Business rules
- All measurement fields are optional — a client can log just weight, or just waist, etc.
- Measurements are ordered by date ascending for charts.
- The `date` column defaults to the current timestamp (set by Supabase `created_at`).
- Weight from measurements is also used on the client detail page for the weight progress chart.

## Gotchas
- The measurement form doesn't pre-fill with the latest values — it shows them as placeholders only.
- In demo mode, measurements use different dates than the mock data in `mock-data.ts`.
- The `MeasurementsChart` component expects a `bodyFat` key (camelCase) but the DB returns `body_fat` (snake_case). Pages manually map this: `data.map((d) => ({ ...d, bodyFat: d.body_fat }))`.

## Key files
- `src/app/(client)/client/measurements/page.tsx` — client measurement logging + charts
- `src/app/(coach)/coach/clients/[id]/page.tsx` — coach view of client measurements
- `src/lib/db.ts` — `getMeasurements`, `addMeasurement`
- `src/components/charts/measurements-chart.tsx` — line chart component
- `src/components/charts/weight-chart.tsx` — weight-specific chart with target line
