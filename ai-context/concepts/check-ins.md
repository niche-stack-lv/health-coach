# Weekly Check-ins

## What it does
Clients submit weekly progress check-ins with weight, progress photos (front/side/back), and notes. The coach reviews them with photo viewing, optionally provides feedback, and marks them as reviewed.

## How it works (step by step)
1. Client navigates to `/client/check-in`.
2. Client uploads up to 3 photos (front, side, back) via file input.
3. Client enters current weight (kg) and optional notes.
4. On submit: photos are uploaded to Supabase Storage (`check-in-photos` bucket), then a `check_ins` row is inserted with status `"pending"`.
5. Coach sees pending check-ins on the dashboard and at `/coach/check-ins`.
6. Coach clicks "View photos" on a check-in to lazy-load signed URLs and see the photos in a grid.
7. Coach can click a photo to open it in a full-screen lightbox.
8. Coach can write feedback (textarea) and submit → updates `coach_feedback` and sets status to `"reviewed"`. Or just mark as reviewed without feedback.
9. Client sees the latest coach feedback on their home page.

## Business rules
- Check-in status: `"pending"` → `"reviewed"`. No other transitions.
- Photos are stored as an array of storage paths in the `photos` column (JSONB).
- The coach check-ins page fetches check-ins by first getting all client IDs for the coach, then querying check-ins with `.in()`.
- Check-ins are not tied to a specific plan in practice — `plan_id` is optional.
- Photo signed URLs expire after 1 hour. If the coach leaves the page open, they'll need to reload to get fresh URLs.

## Gotchas
- The feedback update goes directly to Supabase from the check-ins page (not through `db.ts`) — it imports `getSupabase()` directly.
- In demo mode, check-in submission just sets a timeout and shows success — no actual upload.
- The `check-in-photos` Supabase Storage bucket must exist and allow authenticated reads for photo display to work.

## Key files
- `src/app/(client)/client/check-in/page.tsx` — client check-in form
- `src/app/(coach)/coach/check-ins/page.tsx` — coach review page with photo display
- `src/app/(coach)/coach/page.tsx` — dashboard shows pending check-ins
- `src/lib/db.ts` — `getCheckIns`, `getCoachCheckIns`, `createCheckIn`, `getCheckInPhotoUrls`
