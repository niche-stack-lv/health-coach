# Leads & Pricing Flow

## What it does
The public-facing pricing page and enquiry form capture leads (prospective clients). The pricing page is a multi-step checkout flow that ends with a UPI payment and WhatsApp confirmation. The enquiry form collects detailed fitness information and sends it via WhatsApp.

## How it works (step by step)

### Pricing flow (`/pricing`)
1. User selects a goal (Fat Loss, Weight Loss, etc.).
2. User selects duration (4/8/12 weeks).
3. User selects plan type: One-Time (diet/workout/supplementation), Gold, or Platinum.
4. If One-Time: user picks which plans they want (single or all 3).
5. User fills out "About You" form (age, gender, weight, height, diet preference, gym access, experience, injuries).
6. User sees price summary and proceeds to payment.
7. Payment screen shows UPI QR code and UPI ID to copy.
8. User uploads payment screenshot, enters name/phone/email.
9. On confirm: `saveLead()` saves to `leads` table, then opens WhatsApp with pre-formatted order details.
10. Success screen with option to download a branded PDF confirmation.

### Enquiry flow (`/enquiry`)
1. 4-step form: Basic info → Goals → Lifestyle → Final (referral source + message).
2. On submit: `saveLead()` saves to `leads` table, then opens WhatsApp with form data.

### Book Call flow (`/book-call`)
1. Single page: UPI QR for ₹499, screenshot upload, name/phone/email.
2. On confirm: `saveLead()` saves to `leads` table, then opens WhatsApp.

### Coach leads management (`/coach/leads`)
1. Coach sees all leads with stats (total, contacted, converted).
2. Filter by status: all/new/contacted/converted.
3. Change status via dropdown on each lead.

## Business rules
- Leads table allows anonymous inserts (RLS: `with check (true)` on insert).
- Only authenticated users can read/update leads.
- Lead status: `"new"` → `"contacted"` → `"converted"`.
- Lead source: `"pricing"`, `"enquiry"`, or `"book-call"`.
- The coach's clients page ("Find & Add" tab) shows paid leads from the pricing page to help the coach link them to accounts.
- There's no automated payment verification — it's all manual via WhatsApp.

## Gotchas
- The pricing page has a back button from the payment step to return to plan details.
- The payment screenshot is held in React state only — it's never uploaded to any storage.
- The confirmation PDF is generated client-side and includes the coach's photo loaded via `fetch()` from `/coach-rajat.jpg`.
- Pricing constants are hardcoded in the pricing page component, not centralized.

## Key files
- `src/app/pricing/page.tsx` — multi-step checkout
- `src/app/enquiry/page.tsx` — enquiry form
- `src/app/book-call/page.tsx` — call booking
- `src/app/(coach)/coach/leads/page.tsx` — leads management
- `src/lib/db.ts` — `saveLead`, `getLeads`, `updateLeadStatus`
- `src/lib/confirmation-pdf.ts` — branded PDF generation
- `supabase/migrations/20250428000000_initial_schema.sql` — leads table schema
