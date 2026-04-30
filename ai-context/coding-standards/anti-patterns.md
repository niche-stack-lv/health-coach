# Patterns to avoid

Things that look fine generically but break something in this codebase.

## 1. Using `useSearchParams()` Without Suspense Boundary

**Wrong:**
```tsx
export default function MyPage() {
  const searchParams = useSearchParams(); // ❌ causes hydration error
  return <div>...</div>;
}
```

**Right:**
```tsx
export default function MyPage() {
  return <Suspense fallback={<Spinner />}><MyPageInner /></Suspense>;
}
function MyPageInner() {
  const searchParams = useSearchParams(); // ✅
  return <div>...</div>;
}
```
Next.js 16 requires Suspense around any component using `useSearchParams()`.

## 2. Importing from `@supabase/ssr` for Client-Side Code

**Wrong:**
```tsx
import { createBrowserClient } from "@supabase/ssr"; // ❌ not used in this project
```

**Right:**
```tsx
import { getSupabase } from "@/lib/supabase"; // ✅ singleton client
```
The project uses `@supabase/supabase-js` directly with a singleton pattern. `@supabase/ssr` is in `package.json` but not used anywhere in the code.

## 3. Creating a New Supabase Client Per Request

**Wrong:**
```tsx
const supabase = createClient(url, key); // ❌ creates new instance every time
```

**Right:**
```tsx
const sb = getSupabase(); // ✅ reuses singleton
```
`getSupabase()` in `src/lib/supabase.ts` caches the client in a module-level variable.

## 4. Adding Server Components That Fetch Data

**Wrong:**
```tsx
// page.tsx (server component)
export default async function Page() {
  const data = await getClients(userId); // ❌ no user context on server
  return <div>{data.map(...)}</div>;
}
```

**Right:**
```tsx
"use client";
export default function Page() {
  const { user } = useAuth();
  useEffect(() => { if (user) loadData(); }, [user]);
  // ...
}
```
All data fetching goes through the client-side auth context. There are no server actions, no API routes, and no server-side data fetching in this project.

## 5. Using `router.push()` Without Demo Suffix

**Wrong:**
```tsx
router.push("/coach/clients"); // ❌ loses demo mode
```

**Right:**
```tsx
const demo = searchParams.get("demo") === "true" ? "?demo=true" : "";
router.push(`/coach/clients${demo}`); // ✅
```
Or use `useDemoLink()` / `useDemoSuffix()` from `src/lib/use-demo.ts`.

## 6. Adding `any` Types to DB Return Values Without Checking Shape

**Wrong:**
```tsx
const plans = await getDietPlans(user.id);
plans.forEach((p) => console.log(p.nonExistentField)); // ❌ no type safety
```

**Right:**
```tsx
const plans = await getDietPlans(user.id);
// plans is any[] — check db.ts for the actual select() shape before accessing fields
// DB returns snake_case: p.start_date, p.client_id, p.coach_id
```
All DB functions return `any[]`. Field names are snake_case from Supabase, not camelCase from the TypeScript types in `types/index.ts`.

## 7. Using TypeScript Types from `types/index.ts` for DB Data

**Wrong:**
```tsx
import type { DietPlan } from "@/types";
const plan: DietPlan = await getDietPlans(user.id)[0]; // ❌ shape mismatch
// types/index.ts has camelCase: startDate, endDate, coachId
// DB returns snake_case: start_date, end_date, coach_id
```

**Right:**
```tsx
const plans = await getDietPlans(user.id);
const plan = plans[0]; // any — use plan.start_date, plan.coach_id
```
The TypeScript types in `types/index.ts` use camelCase and represent the frontend model. DB data uses snake_case. They are NOT the same shape. The types are mainly used by `mock-data.ts` and the in-memory store.

## 8. Adding API Routes for Operations Already in `db.ts`

**Wrong:**
```tsx
// app/api/clients/route.ts
export async function GET() { ... } // ❌ unnecessary indirection
```

**Right:**
```tsx
// Call db.ts directly from the client component
import { getClients } from "@/lib/db";
const clients = await getClients(user.id);
```
This project has zero API routes. All DB operations go directly from client components to Supabase via `db.ts`. Don't add API routes unless there's a specific need (e.g., server-side secret, webhook).

## 9. Using `<img>` for Internal Assets Instead of `next/image`

**Wrong:**
```tsx
<img src="/coach-rajat.jpg" /> // ❌ no optimization
```

**Right:**
```tsx
import Image from "next/image";
<Image src="/coach-rajat.jpg" alt="Coach Rajat" width={36} height={36} />
```
The codebase is inconsistent here — the landing page uses `<img>` for testimonials but `<Image>` for the hero. Prefer `next/image` for new code.

## 10. Wrapping Components in Extra Providers

**Wrong:**
```tsx
// Some new layout
<AuthProvider><StoreProvider>{children}</StoreProvider></AuthProvider> // ❌ double-wrapping
```

**Right:**
```tsx
// Providers are already in the root layout via <Providers>
// Just use useAuth() and useStore() directly
```
`AuthProvider` and `StoreProvider` are set up once in `src/components/providers.tsx`, wrapped in the root layout. Don't add them again in nested layouts.

## 11. Using `force-dynamic` on New Route Groups

**Wrong:**
```tsx
// Adding force-dynamic to a new page
export const dynamic = "force-dynamic"; // ❌ unless you have a specific reason
```

**Right:**
Only the `(coach)` and `(client)` layout files set `force-dynamic` because they use auth guards that depend on runtime state. Don't add it to individual pages or public pages.

## 12. Hardcoding Colors Instead of Using Theme Variables

**Wrong:**
```tsx
<div className="bg-[#d4a853]" /> // ❌ hardcoded gold
<div className="text-[#0a0a0a]" /> // ❌ hardcoded background
```

**Right:**
```tsx
<div className="bg-gold" />           // ✅ theme color
<div className="text-gold" />         // ✅
<div className="gradient-gold" />     // ✅ gradient class from globals.css
<div className="text-gradient-gold" /> // ✅ text gradient
<div className="bg-gold/10" />        // ✅ with opacity
```
Gold, gold-light, and background colors are defined in `globals.css` as CSS variables and registered in the Tailwind `@theme` block.

## 13. Adding New Dependencies for Things Already Handled

**Wrong:**
```tsx
import { format } from "date-fns"; // ❌ unnecessary dependency
```

**Right:**
```tsx
import { formatDate } from "@/lib/utils"; // ✅ uses Intl.DateTimeFormat
```
Date formatting uses the built-in `Intl.DateTimeFormat`. Class merging uses `cn()` (clsx + tailwind-merge). Don't add date-fns, classnames, or other utility libraries.

## 14. Forgetting `safe-area-bottom` on Fixed Bottom Elements

**Wrong:**
```tsx
<div className="fixed bottom-0 left-0 right-0 p-4"> // ❌ content hidden behind iPhone home bar
```

**Right:**
```tsx
<div className="fixed bottom-0 left-0 right-0 safe-area-bottom p-4"> // ✅
```
The `safe-area-bottom` class adds `padding-bottom: env(safe-area-inset-bottom)` for iOS devices.

## 15. Using `window.location` Instead of Next.js Router

**Wrong:**
```tsx
const params = new URLSearchParams(window.location.search); // ❌ SSR unsafe
window.location.href = "/coach"; // ❌ full page reload
```

**Right:**
```tsx
const searchParams = useSearchParams(); // ✅
const router = useRouter();
router.push("/coach"); // ✅ client-side navigation
```
All pages now use `useSearchParams()` correctly.
