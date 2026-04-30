# Auth & Roles

## What it does
Handles user authentication (email/password via Supabase Auth) and role-based access control. Two roles exist: `coach` and `client`. The coach sees a sidebar dashboard; clients see a mobile-first bottom-nav portal.

## How it works (step by step)
1. User signs up via `/signup` → Supabase `auth.signUp()` creates auth user → a `profiles` row is inserted with `role: "client"`.
2. User signs in via `/login` → Supabase `auth.signInWithPassword()` → the app fetches `profiles.role` for the user → redirects to `/coach` or `/client` based on role.
3. On app load, `AuthProvider` calls `auth.getSession()` and subscribes to `onAuthStateChange` to maintain session state.
4. Route groups `(coach)` and `(client)` wrap their layouts with `CoachGuard` / `ClientGuard` respectively.
5. Guards check `user` and `role` from context. If not authenticated or wrong role, redirect to `/login`.
6. Demo mode (`?demo=true`) bypasses guards entirely — no auth check happens.

## Business rules
- Only one coach exists. There's no coach registration flow — the coach account must be created directly in Supabase.
- Signup always creates a `client` role. The role is hardcoded in `signup/page.tsx`.
- The coach can also create client accounts via "Add Client" which generates a temp password.
- Password reset uses Supabase's `resetPasswordForEmail` with redirect to `/login`.
- Session persistence is handled by Supabase's built-in cookie/localStorage mechanism.

## Gotchas
- The `AuthProvider` fetches role from the `profiles` table on every auth state change. If the profiles table is slow or the row doesn't exist, the app hangs on the loading spinner.
- There's no email verification enforcement — users can sign in immediately after signup (Supabase may send a verification email depending on project settings, but the app doesn't check `email_confirmed_at`).
- The `useAuth()` hook throws if used outside `AuthProvider` — but since Providers wraps the root layout, this shouldn't happen.

## Key files
- `src/lib/auth-context.tsx` — AuthProvider, useAuth hook
- `src/components/auth-guard.tsx` — CoachGuard, ClientGuard
- `src/app/login/page.tsx` — login form
- `src/app/signup/page.tsx` — registration form
- `src/app/forgot-password/page.tsx` — password reset
- `src/lib/use-demo.ts` — demo mode hooks
