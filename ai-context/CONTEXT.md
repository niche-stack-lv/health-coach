# FitCoach Platform — Context

## What it does

A white-label fitness coaching platform sold as a service to multiple coaching clients. Each coaching client (e.g., a fitness coach, nutritionist, lifestyle coach) gets their own branded deployment with a custom landing page, their own Supabase database, and their own domain — all powered by a single shared codebase.

The platform connects a coach with their clients through a web portal where the coach creates custom diet plans, workout programs, and habit trackers. Clients log in to view their plans, submit weekly check-ins with photos and weight, track body measurements, and complete daily habit checklists. The public-facing side handles lead capture through an enquiry form and a pricing/checkout flow that uses UPI payments with manual verification via WhatsApp.

## Multi-tenant architecture

This is a **single-repo, per-client deployment** setup:

- **One codebase** — all clients share the same platform code
- **Per-client config** — each client has their own folder in `clients/` with a config file and custom landing page
- **Per-client deployment** — each client gets their own Vercel project with their own env vars
- **Per-client database** — each client has their own Supabase project (complete data isolation)
- **CLIENT_ID env var** — determines which client config to load at build time

```
clients/
├── arsh-sandhu/
│   ├── config.ts          ← Brand, colors, contact, SEO (platform needs)
│   └── landing.tsx        ← Fully custom landing page
├── _template.ts           ← Config template for new clients
├── types.ts               ← TypeScript interface for shared platform fields
└── README.md              ← Onboarding guide

site.config.ts             ← Loader: reads CLIENT_ID, picks the right config
src/app/page.tsx           ← Router: picks the right landing page
```

### What's shared (white-labeled via config)
- Coach dashboard (`/coach/*`)
- Client portal (`/client/*`)
- Login / Signup / Forgot password
- Pricing page, Enquiry form, Book-call page
- About-platform page
- PDF generation
- Colors, fonts, brand name in sidebar/navbar

### What's fully custom per client
- Landing page (`/`) — different layout, sections, data, design
- Any client-specific data (testimonials, achievements, programs, about content)

### Adding a new client
1. `mkdir clients/<client-id>`
2. `cp clients/_template.ts clients/<client-id>/config.ts` — fill in values
3. Create `clients/<client-id>/landing.tsx` — custom landing page
4. Add images to `public/<client-folder>/`
5. Register in `site.config.ts` (import + add to `clients` map)
6. Register in `src/app/page.tsx` (dynamic import + add to `landings` map)
7. Create new Supabase project (run migrations with `supabase db push`)
8. Create new Vercel project with env vars: `CLIENT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Stack

- **Runtime**: Node.js (Next.js 16.2.1 with React 19, App Router)
- **Language**: TypeScript 5, strict mode
- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss`, configurable dark theme
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage) via `@supabase/supabase-js` v2
- **Charts**: Recharts 3.8
- **PDF Generation**: jsPDF 4.2
- **UI Primitives**: Custom components (no shadcn/ui, no Radix) using `class-variance-authority` + `clsx` + `tailwind-merge`
- **Icons**: Lucide React
- **Compiler**: React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`
- **Deployment**: Vercel (one project per client)
- **CLI**: Supabase CLI v2.95+ for migrations

## How to run

```bash
npm install
npm run dev          # starts Next.js dev server on localhost:3000
npm run build        # production build
npm run lint         # ESLint
```

Required env vars in `.env.local`:
```
CLIENT_ID=arsh-sandhu
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app throws at runtime if Supabase credentials are missing. If `CLIENT_ID` is not set, it defaults to the first registered client with a console warning.

Database schema is managed via Supabase CLI migrations in `supabase/migrations/`. Push to a linked project with `supabase db push`.

No test framework is set up. No tests exist.

## Folder structure

```
/                                 # Repo root
├── clients/                      # Per-client configs and landing pages
│   ├── <client-id>/
│   │   ├── config.ts             # Client's platform config (satisfies ClientConfig type)
│   │   └── landing.tsx           # Client's custom landing page component
│   ├── _template.ts              # Config template for new clients
│   ├── types.ts                  # ClientConfig interface (shared platform fields only)
│   └── README.md                 # Onboarding instructions
├── site.config.ts                # Config loader (CLIENT_ID → config)
├── next.config.ts                # Next.js config (passes CLIENT_ID to build)
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout (fonts, metadata, Providers wrapper)
│   │   ├── page.tsx              # Landing page router (CLIENT_ID → landing component)
│   │   ├── globals.css           # Tailwind + custom theme (CSS vars, glass effects)
│   │   ├── login/                # Email/password login
│   │   ├── signup/               # Client self-registration (role=client)
│   │   ├── forgot-password/      # Password reset via Supabase
│   │   ├── pricing/              # Multi-step checkout with UPI QR + WhatsApp confirmation
│   │   ├── enquiry/              # Multi-step lead capture form → WhatsApp
│   │   ├── book-call/            # Book a phone consultation → WhatsApp
│   │   ├── about-platform/       # Feature walkthrough with live demo iframes
│   │   ├── (coach)/              # Route group: coach dashboard (CoachGuard)
│   │   │   ├── layout.tsx        # Sidebar layout + auth guard
│   │   │   └── coach/
│   │   │       ├── page.tsx      # Dashboard: stats, pending check-ins, active clients
│   │   │       ├── leads/        # CRM-lite: view/filter/update lead status
│   │   │       ├── clients/      # Client list + detail view (tabs: overview, profile, diet, workout, measurements, habits)
│   │   │       ├── dishes/       # Dish library CRUD (building blocks for templates)
│   │   │       ├── diet-templates/ # Diet template CRUD + assign to client
│   │   │       ├── workout-templates/ # Workout template CRUD
│   │   │       ├── workouts/     # Assigned workout plans list + create/assign
│   │   │       ├── daily-check-ins/ # Review daily food check-ins from clients
│   │   │       ├── check-ins/    # Review weekly photo check-ins
│   │   │       └── settings/     # Profile settings
│   │   └── (client)/             # Route group: client portal (ClientGuard)
│   │       ├── layout.tsx        # Bottom nav layout + auth guard
│   │       └── client/
│   │           ├── page.tsx      # Client home: plan cards, quick actions
│   │           ├── diet-plan/    # View assigned diet template (mobile-first vertical layout)
│   │           ├── food-check-in/ # Daily check-in: food selections + weight
│   │           ├── workout/      # View assigned workout (day tabs + exercises)
│   │           ├── habits/       # Daily habit checklist with toggle
│   │           ├── measurements/ # Log & chart body measurements
│   │           ├── check-in/     # Submit weekly check-in (photos, weight, notes)
│   │           ├── onboarding/   # 7-step onboarding questionnaire (~21 fields)
│   │           └── profile/      # View profile, onboarding summary, sign out
│   ├── components/
│   │   ├── providers.tsx         # AuthProvider + StoreProvider wrapper
│   │   ├── auth-guard.tsx        # CoachGuard / ClientGuard (role-based + demo mode)
│   │   ├── theme-vars.tsx        # Injects CSS vars from config.colors into :root
│   │   ├── ui/                   # Reusable UI primitives (Button, Card, Badge, Avatar, StatCard)
│   │   ├── coach/sidebar.tsx     # Coach sidebar navigation (desktop + mobile)
│   │   ├── client/navbar.tsx     # Client top bar + bottom tab navigation
│   │   └── charts/              # Recharts wrappers (weight, measurements, compliance, revenue)
│   ├── lib/
│   │   ├── config.ts            # Re-exports site config as `config` + `formatPrice()` helper
│   │   ├── supabase.ts          # Singleton Supabase client
│   │   ├── db.ts                # All database operations (CRUD for every entity)
│   │   ├── auth-context.tsx     # React context for auth state (signUp, signIn, signOut, role)
│   │   ├── store.tsx            # In-memory React context store (demo mode + workout edit)
│   │   ├── mock-data.ts         # Demo/seed data
│   │   ├── food-database.ts     # Static food items with per-100g macros
│   │   ├── exercise-database.ts # Static exercise list by muscle group
│   │   ├── exercise-videos.ts   # YouTube video ID mapping for exercise demos
│   │   ├── pdf-export.ts        # Diet plan + workout plan PDF generation
│   │   ├── confirmation-pdf.ts  # Order confirmation PDF (2-page branded document)
│   │   ├── use-demo.ts          # Hooks for demo mode (?demo=true)
│   │   └── utils.ts             # cn(), formatDate(), getInitials()
│   └── types/
│       └── index.ts             # TypeScript interfaces (User, Client, DietPlan, etc.)
├── public/                       # Static assets (per-client image folders)
├── supabase/
│   ├── config.toml              # Supabase CLI config (project_id)
│   └── migrations/              # SQL migration files
└── .env.local                   # Local env vars (CLIENT_ID + Supabase creds)
```

## Config architecture

### `clients/types.ts` — shared platform fields only
The type enforces only what the shared platform code needs to function:
- `brand` — name, copyright, login/signup subtitles (sidebar, navbar, auth pages)
- `coach` — name, title, credentials, quote, motivations (sidebar, PDFs)
- `images` — coachPhoto, upiQr, ogImage (sidebar, PDFs, payment pages)
- `colors` — primary/light/dark + RGB tuples (theme system, charts, PDFs)
- `contact` — WhatsApp, UPI, website, social links (payment flows, PDFs)
- `seo` — title, description, OG metadata (root layout)
- `[key: string]: unknown` — allows any extra client-specific fields

### Client-specific data
Anything beyond the shared type (pricing tiers, programs, testimonials, achievements, about-platform content) is added as extra fields on the client's config and consumed by their custom pages directly.

### Config flow
```
CLIENT_ID env var
    → site.config.ts (loader picks the right client config)
    → src/lib/config.ts (re-exports as `config`)
    → all platform components import from @/lib/config
```

## Domain vocabulary

| Term | What it means |
|------|--------------|
| Coach | The admin user who manages clients and creates plans |
| Client | A person receiving coaching, linked to the coach |
| Profile | Supabase `profiles` row with name, email, role |
| Lead | A prospective client who submitted an enquiry or started checkout |
| Diet Template | A reusable meal plan structure with slots and dish options |
| Dish | A pre-defined recipe with fixed portions and auto-calculated macros |
| Meal Slot | A single meal occasion within a template (Breakfast, Lunch, etc.) |
| Component | A nutritional category within a meal slot (protein, carbs, fats, fiber, complete_meal, supplements) |
| Workout Template | A reusable workout structure with slots and exercises |
| Workout Slot | A single training day within a workout template |
| Template Assignment | Links a diet template to a client (one active per client) |
| Workout Assignment | Links a workout template to a client (latest = active) |
| Food Check-in | Daily food + weight log by client (merged daily check-in) |
| Check-in | Weekly client submission with weight, photos, and notes |
| Measurement | Body measurement log (weight, body fat, chest, waist, etc.) |
| Habit | A daily task assigned by the coach |
| Habit Log | A daily completion record for a habit |
| Demo Mode | `?demo=true` query param that bypasses auth and shows mock data |
| CLIENT_ID | Env var that determines which client config/landing to load |
| White-label | The platform adapts its branding per client via config |

## Business rules

- The system is single-tenant per deployment — one coach per Supabase project.
- Clients can only be role `"client"`, coach is role `"coach"`. Role is stored in `profiles.role`.
- A client must have a profile before being linked as a client. `clients.id` = `profiles.id`.
- Diet templates have 1-6 meal slots with component categories (protein, carbs, fats, fiber, complete_meal, supplements).
- Component categories are unified across dishes and foods — same 6 values in both tables.
- Plan types are dynamic/custom — coaches can create their own (stored in `plan_types` table).
- Meal slot components can contain both dishes AND individual food items (via `meal_slot_dishes` table with `dish_id` OR `food_id`).
- Workout templates have 1-7 workout slots with exercises.
- Plans are assigned to clients via assignment tables (template_assignments, workout_assignments).
- Check-in status: `"pending"` → `"reviewed"` (for weekly photo check-ins).
- Daily food check-ins: `"submitted"` → `"reviewed"` (coach reviews with feedback).
- Lead status: `"new"` → `"contacted"` → `"converted"`.
- Payments are manual UPI transfers verified by the coach via WhatsApp.
- PDF exports happen client-side using jsPDF.
- All Supabase queries use the anon key — RLS policies control access.
- Demo mode (`?demo=true`) bypasses auth guards and renders hardcoded mock data.
- Food database and exercise database are static TypeScript arrays — not in the DB.
- Old `daily_check_ins`, `diet_plans`, `diet_meals`, `workout_plans`, `workout_days` tables are deprecated/dropped.
- The active system uses: dishes → diet_templates → template_assignments → food_check_ins.
- Client onboarding questionnaire (~21 fields) stored in `client_onboarding` table with individual typed columns.

## Key constants and enums

```typescript
type UserRole = "coach" | "client";
type ClientStatus = "active" | "inactive";
type PlanStatus = "active" | "completed" | "draft";
type CheckInStatus = "pending" | "reviewed";
type LeadStatus = "new" | "contacted" | "converted";
type LeadSource = "pricing" | "enquiry" | "book-call";
type FoodCategory = "protein" | "carbs" | "fats" | "fiber" | "complete_meal" | "supplements";
type ComponentCategory = "protein" | "carbs" | "fats" | "fiber" | "complete_meal" | "supplements";
type ExerciseCategory = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio";
const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
```

Note: Pricing, WhatsApp number, UPI ID, and brand colors are all per-client — defined in each client's config file, not as global constants.
