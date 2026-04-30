# FitCoach — Context

## What it does

FitCoach is a personalized fitness coaching platform built for IFBB Pro Rajat Goel. It connects a single coach (Rajat) with his clients through a web portal where he creates custom diet plans, workout programs, and habit trackers. Clients log in to view their plans, submit weekly check-ins with photos and weight, track body measurements, and complete daily habit checklists. The public-facing side handles lead capture through an enquiry form and a pricing/checkout flow that uses UPI payments with manual verification via WhatsApp.

## Stack

- **Runtime**: Node.js (Next.js 16.2.1 with React 19, App Router)
- **Language**: TypeScript 5, strict mode
- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss`, custom gold/dark theme
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage) via `@supabase/supabase-js` v2
- **Charts**: Recharts 3.8
- **PDF Generation**: jsPDF 4.2
- **UI Primitives**: Custom components (no shadcn/ui, no Radix) using `class-variance-authority` + `clsx` + `tailwind-merge`
- **Icons**: Lucide React
- **Compiler**: React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`

## How to run

```bash
npm install
npm run dev          # starts Next.js dev server on localhost:3000
npm run build        # production build
npm run lint         # ESLint
```

No `.env` file is committed — Supabase credentials must be configured locally. To set up:
1. Copy `.env.example` to `.env.local`
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase project credentials

The app will throw at runtime if these are missing.

Database schema is managed via Supabase CLI migrations in `supabase/migrations/`. See `supabase/README.md` for the migration workflow.

No test framework is set up. No tests exist.

All coach-specific content (name, bio, colors, pricing, images, contact info) is centralized in `site.config.ts` at the repo root. See `ai-context/concepts/white-label-config.md` for the full rebranding guide.

## Folder structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, metadata, Providers wrapper)
│   ├── page.tsx                  # Public landing page (marketing site)
│   ├── globals.css               # Tailwind + custom theme (gold/dark colors, glass effects)
│   ├── login/                    # Email/password login
│   ├── signup/                   # Client self-registration (role=client)
│   ├── forgot-password/          # Password reset via Supabase
│   ├── pricing/                  # Multi-step checkout with UPI QR + WhatsApp confirmation
│   ├── enquiry/                  # Multi-step lead capture form → WhatsApp
│   ├── book-call/                # Book a ₹499 phone consultation → WhatsApp
│   ├── about-platform/           # Feature walkthrough with live demo iframes
│   ├── (coach)/                  # Route group: coach dashboard (CoachGuard)
│   │   ├── layout.tsx            # Sidebar layout + auth guard
│   │   └── coach/
│   │       ├── page.tsx          # Dashboard: stats, pending check-ins, active clients
│   │       ├── leads/            # CRM-lite: view/filter/update lead status
│   │       ├── clients/          # Client list + detail view with charts
│   │       ├── plans/            # Diet plan CRUD with food database picker
│   │       ├── workouts/         # Workout plan CRUD with exercise database picker
│   │       ├── check-ins/        # Review client check-ins, give feedback
│   │       └── settings/         # Profile settings (mostly static/placeholder)
│   └── (client)/                 # Route group: client portal (ClientGuard)
│       ├── layout.tsx            # Bottom nav layout + auth guard
│       └── client/
│           ├── page.tsx          # Client home: current plan, quick actions, coach feedback
│           ├── plan/             # View assigned diet plan + PDF export
│           ├── workout/          # View assigned workout plan + YouTube video links
│           ├── habits/           # Daily habit checklist with toggle
│           ├── measurements/     # Log & chart body measurements
│           ├── check-in/         # Submit weekly check-in (photos, weight, notes)
│           └── profile/          # View profile, stats, sign out
├── components/
│   ├── providers.tsx             # AuthProvider + StoreProvider wrapper
│   ├── auth-guard.tsx            # CoachGuard / ClientGuard (role-based + demo mode)
│   ├── ui/                       # Reusable UI primitives (Button, Card, Badge, Avatar, StatCard)
│   ├── coach/sidebar.tsx         # Coach sidebar navigation (desktop + mobile)
│   ├── client/navbar.tsx         # Client top bar + bottom tab navigation
│   └── charts/                   # Recharts wrappers (weight, measurements, compliance, revenue)
├── lib/
│   ├── supabase.ts               # Singleton Supabase client
│   ├── db.ts                     # All database operations (CRUD for every entity)
│   ├── auth-context.tsx          # React context for auth state (signUp, signIn, signOut, role)
│   ├── store.tsx                 # In-memory React context store (used by demo mode + workout edit)
│   ├── mock-data.ts              # Demo/seed data for clients, plans, check-ins, measurements, habits
│   ├── food-database.ts          # Static food items with per-100g macros (Indian + Western foods)
│   ├── exercise-database.ts      # Static exercise list by muscle group with equipment
│   ├── exercise-videos.ts        # YouTube video ID mapping for exercise demos
│   ├── pdf-export.ts             # Diet plan + workout plan PDF generation (jsPDF)
│   ├── confirmation-pdf.ts       # Order confirmation PDF (2-page branded document)
│   ├── use-demo.ts               # Hooks for demo mode (?demo=true query param)
│   └── utils.ts                  # cn(), formatDate(), getInitials()
├── types/
│   └── index.ts                  # TypeScript interfaces (User, Client, DietPlan, Meal, CheckIn, etc.)
```

## Domain vocabulary

| Term | What it means | Also called |
|------|--------------|-------------|
| Coach | The single admin user (Rajat Goel) who manages everything | — |
| Client | A person receiving coaching, linked to the coach | — |
| Profile | Supabase `profiles` row with name, email, role | User |
| Lead | A prospective client who submitted an enquiry or started checkout | — |
| Diet Plan | A time-bound meal plan with multiple meals, assigned to a client | Plan |
| Meal | A single eating occasion within a diet plan (Breakfast, Lunch, etc.) | — |
| Diet Meal | Database row for a meal within a diet plan | — |
| Workout Plan | A multi-day exercise program assigned to a client | — |
| Workout Day | A single training day within a workout plan (e.g., "Day 1: Push") | — |
| Exercise | A single movement within a workout day (sets × reps × rest) | — |
| Check-in | Weekly client submission with weight, photos, and notes | — |
| Coach Feedback | Text response from coach on a check-in | — |
| Measurement | Body measurement log (weight, body fat, chest, waist, etc.) | Body log |
| Habit | A daily task assigned by the coach (e.g., "Drink 3L water") | — |
| Habit Log | A daily completion record for a habit | — |
| Demo Mode | `?demo=true` query param that bypasses auth and shows mock data | — |
| One-Time Plan | A plan type where client gets a PDF plan without ongoing coaching | — |
| Gold Plan | Subscription tier with weekly check-ins and app access | Customized Gold |
| Platinum Plan | Premium tier with WhatsApp support and video calls | Customized Platinum |
| UPI | Unified Payments Interface — Indian digital payment system | — |
| Promote | Converting a signed-up profile into a client under the coach | — |

## Business rules

- There is exactly one coach (Rajat). The system is single-tenant for the coach side.
- Clients can only be role `"client"`, coach is role `"coach"`. Role is stored in `profiles.role`.
- A client must have a profile before being linked as a client. The `clients.id` = `profiles.id`.
- Adding a client via the "Add Client" modal creates a Supabase auth user with a random temp password.
- "Promote to client" links an existing signed-up profile to the coach without creating new auth.
- Diet plans have exactly 4 meals (Breakfast, Lunch, Snack, Dinner) — enforced by the UI, not the DB.
- Workout plans have 3-6 days — enforced by the UI.
- Check-ins have three statuses: `"pending"` (submitted by client) → `"reviewed"` (marked by coach).
- Lead status flows: `"new"` → `"contacted"` → `"converted"`.
- Lead source is either `"pricing"` (from checkout flow), `"enquiry"` (from enquiry form), or `"book-call"` (from call booking).
- Payments are manual UPI transfers verified by the coach via WhatsApp — no payment gateway integration.
- The pricing page sends order details to WhatsApp after the user uploads a payment screenshot.
- PDF exports happen client-side using jsPDF — no server-side PDF generation.
- All Supabase queries use the anon key — RLS policies control access.
- Anonymous users can insert leads (RLS policy: `with check (true)` on insert).
- Only authenticated users can read/update leads.
- Demo mode (`?demo=true`) bypasses auth guards and renders hardcoded mock data.
- Food database and exercise database are static TypeScript arrays — not stored in the DB.
- Macros are calculated per-100g and scaled by the gram amount entered.

## Key constants and enums

```typescript
// User roles
type UserRole = "coach" | "client";

// Client status
type ClientStatus = "active" | "inactive";

// Plan status
type PlanStatus = "active" | "completed" | "draft";

// Check-in status
type CheckInStatus = "pending" | "reviewed";

// Lead status
type LeadStatus = "new" | "contacted" | "converted";

// Lead source
type LeadSource = "pricing" | "enquiry" | "book-call";

// Photo types (check-in)
type PhotoType = "front" | "side" | "back";

// Food categories
type FoodCategory = "protein" | "carbs" | "fats" | "supplements";

// Exercise categories (muscle groups)
type ExerciseCategory = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio";

// Meal types (fixed 4)
const mealTypes = ["breakfast", "lunch", "snack", "dinner"];

// Pricing (INR)
const oneTimeSinglePrice = { "4": 999, "8": 1599, "12": 1999 };
const oneTimeAllPrice = { "4": 1999, "8": 2999, "12": 3999 };
const goldPrice = { "4": 4999, "8": 7999, "12": 10999 };
const platinumPrice = { "4": 6999, "8": 10999, "12": 14999 };
const callPrice = 499; // ₹499 for phone consultation

// UPI ID
const UPI_ID = "9560133404@pthfc";

// WhatsApp number
const WHATSAPP_NUMBER = "917351111165";

// Brand colors
const gold = "#d4a853";
const goldLight = "#e8c97a";
const background = "#0a0a0a";
```
