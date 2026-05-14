# White-Label & Multi-Client Architecture

## What it does
The platform serves multiple coaching clients from a single codebase. Each client gets their own branded deployment with a custom landing page, their own database, and their own domain. The shared platform (dashboard, client portal, auth pages) is white-labeled via a per-client config file.

## Architecture

```
Single repo → Multiple deployments (one per coaching client)
Each deployment has:
  - Its own CLIENT_ID env var
  - Its own Supabase project (separate DB, auth, storage)
  - Its own Vercel project (separate domain)
  - Its own config (brand, colors, contact, etc.)
  - Its own custom landing page
```

## How it works

### Config loading
1. `CLIENT_ID` env var is set per deployment (e.g., `arsh-sandhu`)
2. `site.config.ts` imports all client configs and picks the right one based on `CLIENT_ID`
3. `src/lib/config.ts` re-exports it as `config` + provides `formatPrice()` helper
4. All platform components import from `@/lib/config`
5. `src/components/theme-vars.tsx` injects `config.colors` as CSS custom properties into `:root`

### Landing page routing
1. `src/app/page.tsx` has a registry of dynamic imports for each client's landing page
2. Based on `CLIENT_ID`, it renders the correct landing component
3. Each landing page is a fully custom React component — no shared structure

## What the shared type enforces (`clients/types.ts`)

Only fields the platform code ALWAYS needs:

| Field | Used by |
|-------|---------|
| `brand.name` | Sidebar, navbar, PDFs, footer |
| `brand.copyrightHolder` | Footer |
| `brand.signupSubtitle` | Signup page |
| `brand.loginSubtitle` | Login page |
| `coach.name/firstName` | Sidebar, PDFs, pricing, book-call |
| `coach.title/credentials` | Sidebar, PDFs |
| `coach.quote/bioBullets/motivations` | PDF confirmation |
| `images.coachPhoto` | Sidebar, PDFs |
| `images.upiQr` | Pricing, book-call |
| `images.ogImage` | SEO meta |
| `colors.*` | ThemeVars, charts, PDFs |
| `contact.*` | WhatsApp flows, PDFs, UPI |
| `seo.*` | Root layout metadata |

Everything else (pricing, programs, testimonials, about-platform, landing page data) is client-specific. Clients can add any extra fields — the type has `[key: string]: unknown`.

## How to onboard a new client

1. `mkdir clients/<client-id>`
2. `cp clients/_template.ts clients/<client-id>/config.ts` — fill in platform fields
3. Create `clients/<client-id>/landing.tsx` — fully custom landing page
4. Add images to `public/<client-folder>/`
5. In `site.config.ts`: add import + entry to `clients` map
6. In `src/app/page.tsx`: add dynamic import + entry to `landings` map
7. Create new Supabase project, link with CLI, push migrations
8. Create new Vercel project with env vars:
   - `CLIENT_ID=<client-id>`
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
9. Push to main — auto-deploys

## How to hand off code to a client

If a client wants ownership of their code, export a standalone copy:
- Copy `src/`, `public/<their-folder>/`, `supabase/`, etc.
- Inline their config directly into `site.config.ts` (no loader, no `clients/` folder)
- Strip the `clients/` directory entirely
- They get a clean, self-contained repo with no reference to other clients

## Gotchas

- `CLIENT_ID` must be set as a server-side env var (not just `NEXT_PUBLIC_`). The `next.config.ts` passes it through via the `env` config option.
- If `CLIENT_ID` is not set, the loader defaults to the first registered client with a console warning — useful for local dev but should always be explicit in production.
- Colors flow through CSS variables via `ThemeVars`. The `globals.css` has fallback values but they're overridden at runtime.
- PDF generation uses `config.colors.primaryRgb` — must be an `[R, G, B]` tuple.
- Chart components may have hardcoded color values — update them if changing the primary color.
- Landing pages are `"use client"` components since they use interactive elements.
- The pricing page and about-platform page read optional fields from config (`config.programs`, `config.aboutPlatform`). If a client doesn't include these, those pages will break — either include the fields or create custom versions of those pages for the client.

## Key files

- `clients/types.ts` — shared platform type definition
- `clients/_template.ts` — config template for new clients
- `clients/<client-id>/config.ts` — client's config
- `clients/<client-id>/landing.tsx` — client's custom landing page
- `site.config.ts` — config loader (CLIENT_ID → config)
- `src/app/page.tsx` — landing page router (CLIENT_ID → component)
- `src/lib/config.ts` — re-export + `formatPrice()` helper
- `src/components/theme-vars.tsx` — CSS variable injection
- `next.config.ts` — passes CLIENT_ID to the build
