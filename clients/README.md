# Client Configurations

Each folder in `clients/` represents a single coaching client's white-label setup.

## Structure per client

```
clients/
├── arsh-sandhu/
│   ├── config.ts       ← Brand, colors, pricing, contact, SEO, etc.
│   └── landing.tsx     ← Custom landing page (fully unique per client)
├── _template.ts        ← Config template (copy for new clients)
├── types.ts            ← TypeScript interface all configs must satisfy
└── README.md           ← This file
```

## Adding a new client

1. Create a new folder: `mkdir clients/<client-id>`
2. Copy the config template: `cp clients/_template.ts clients/<client-id>/config.ts`
3. Fill in all values in `config.ts`
4. Create a custom `landing.tsx` in the folder (or copy from an existing client and modify)
5. Add their images to `public/<client-folder>/`
6. Register the client:
   - In `site.config.ts`: add import + entry to the `clients` map
   - In `src/app/page.tsx`: add dynamic import + entry to the `landings` map
7. Create a new Supabase project for them (separate database)
8. Create a new Vercel project pointing to this repo with env vars:
   - `CLIENT_ID=<client-id>` (matches the folder name)
   - `NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
9. Push to main — their Vercel project will auto-deploy

## Local development

Set `CLIENT_ID` in your `.env.local` to work on a specific client:

```
CLIENT_ID=arsh-sandhu
```

## What's shared vs custom

| Shared (white-labeled via config) | Custom per client |
|---|---|
| Coach dashboard (`/coach/*`) | Landing page (`/`) |
| Client portal (`/client/*`) | |
| Login / Signup / Forgot password | |
| Pricing page | |
| Enquiry form | |
| Colors, fonts, brand name | |

## File naming convention

Use kebab-case matching the coach's short name: `arsh-sandhu/`, `coach-mike/`, `priya-fitness/`
