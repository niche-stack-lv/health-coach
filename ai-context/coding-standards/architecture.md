# Architecture Standards

Decisions and constraints that shape how this codebase is structured. Read before designing any new feature.

---

## Core constraints (non-negotiable)

### 1. Fully client-side data fetching
There are no server actions, no API routes, no `getServerSideProps`, no `fetch()` in server components. All data flows:

```
User action → React component → db.ts → Supabase JS client → Supabase DB
```

Why: Auth state lives in the browser (Supabase session). Server-side fetching has no access to the user's session without additional SSR setup this project deliberately avoids.

Consequence: Never add `async` to a page component. Never add `app/api/` routes for data operations.

### 2. All DB logic in `db.ts`
Business logic and data access belong in `src/lib/db.ts`. Pages are UI only.

```typescript
// BAD — business logic in a page component
const { data } = await sb.from("clients").select("*").eq("coach_id", user.id);
const active = data.filter(c => c.status === "active");

// GOOD — logic in db.ts, page calls the function
const clients = await getClients(user.id); // db.ts handles filtering
```

### 3. Config values never hardcoded in `src/`
Anything that differs between clients (name, colors, prices, contact info, images) must come from `config`:

```typescript
import { config } from "@/lib/config";
config.brand.name        // not "DesiSquats"
config.coach.name        // not "Praneeth"
config.contact.whatsapp  // not "919876543210"
config.colors.primary    // not "#d4a853"
```

### 4. One Supabase client (singleton)
```typescript
import { getSupabase } from "@/lib/supabase"; // always
// Never: createClient(url, key) — creates a new instance
```

---

## Layer responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Types | `src/types/index.ts` | TypeScript interfaces (camelCase) |
| DB functions | `src/lib/db.ts` | All Supabase queries and mutations |
| Config | `src/lib/config.ts` | Re-exports site config |
| Utilities | `src/lib/utils.ts` | `cn()`, `formatDate()`, `getInitials()` |
| Auth | `src/lib/auth-context.tsx` | Session, role, sign in/out |
| Store | `src/lib/store.tsx` | In-memory state (demo mode, workout edit) |
| Pages | `src/app/` | UI only — no direct Supabase calls |
| Shared components | `src/components/shared/` | Multi-context renderers (edit/view/select) |
| UI primitives | `src/components/ui/` | Button, Card, Badge, Avatar, StatCard |

---

## Multi-client architecture

### What's shared (in `src/`)
Everything in `src/` deploys to ALL clients. A change here affects every deployment.

### What's per-client (in `clients/<id>/`)
- `config.ts` — brand, colors, coach info, contact, SEO
- `landing.tsx` — fully custom landing page

### Adding a field to `ClientConfig`
1. Add to `clients/types.ts` as optional (`field?: Type`)
2. Update ALL existing `clients/<id>/config.ts` files
3. Use in shared code via `config.field`
4. Never add required fields without updating all clients first

### The two registrations
Every new client must be registered in exactly two places:
- `site.config.ts` — config loader
- `src/app/page.tsx` — landing page router

Missing either = wrong client loads or 404 on landing.

---

## File size and modularity

| File type | Soft limit | Hard limit |
|-----------|-----------|------------|
| Page component | 300 lines | 600 lines |
| Shared component | 200 lines | 400 lines |
| `db.ts` | — | No limit (it's a registry) |
| `types/index.ts` | — | No limit (it's a registry) |

When a page exceeds the soft limit, extract:
- Sub-components to `src/components/shared/` or inline in the same file
- Repeated rendering logic to a shared component with `mode` prop
- Helper functions to the top of the file or `utils.ts`

---

## Bundler: Turbopack (default in Next.js 16)

Turbopack is the default bundler — no configuration needed. It handles CSS, TypeScript, and modern JS natively.

**Do not add a `webpack` callback to `next.config.ts`.** Doing so forces a fallback to Webpack and loses Turbopack's fast refresh and incremental compilation.

```typescript
// BAD — forces Webpack
const nextConfig = {
  webpack: (config) => { ... }
};

// GOOD — Turbopack handles it natively
const nextConfig = {
  reactCompiler: true,
  // no webpack key
};
```

If you think you need a webpack loader (e.g., for SVG, MDX), check if Turbopack has native support first. For this stack (Tailwind 4, TypeScript, standard CSS), no custom loaders are needed.

---

## React Compiler

`reactCompiler: true` is set in `next.config.ts`. This means React automatically memoizes components and hooks — you generally don't need `useMemo`, `useCallback`, or `React.memo` for performance.

Don't add manual memoization unless you have a measured performance problem. The compiler handles it.

---

## State management

No Redux, no Zustand, no Jotai. State lives in:

1. **Component state** (`useState`) — local UI state
2. **Auth context** (`useAuth()`) — user session and role
3. **Store context** (`useStore()`) — demo mode flag, workout edit state
4. **URL params** (`useSearchParams()`) — `?demo=true`, tab selection

For new features: start with `useState`. Only escalate to context if state needs to cross 3+ component levels.

---

## Routing conventions

| Route pattern | Purpose |
|---------------|---------|
| `/(coach)/coach/*` | Coach dashboard (CoachGuard) |
| `/(client)/client/*` | Client portal (ClientGuard) |
| `/pricing`, `/enquiry`, `/book-call` | Public lead capture |
| `/login`, `/signup`, `/forgot-password` | Auth pages |
| `/about-platform` | Feature walkthrough |

Route groups `(coach)` and `(client)` are for layout grouping only — they don't appear in URLs.

---

## When to create a new shared component

Create a component in `src/components/shared/` when:
- The same data structure is rendered in 2+ different pages
- The rendering differs only by interaction mode (edit vs view vs select)

Don't create a shared component for:
- One-off UI that only appears in one place
- Layout wrappers (keep those in the page file)

---

## Architecture decision record format

For significant decisions, document them in `ai-context/concepts/` or inline in the relevant concept file:

```markdown
## Decision: [short title]
**Context:** Why this decision was needed
**Decision:** What was chosen
**Consequences:** What this enables and what it constrains
**Date:** YYYY-MM-DD
```

Example decisions already made:
- Client-side only data fetching (no SSR) — enables simple auth, constrains SEO
- Single `db.ts` for all queries — enables consistency, means the file is large
- Per-client Supabase projects — enables data isolation, means no cross-client queries
- Turbopack default — enables fast HMR, means no webpack customization
