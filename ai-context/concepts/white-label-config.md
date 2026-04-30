# White-Label Configuration

## What it does
Every coach-specific value in the platform (name, bio, colors, pricing, images, contact info, social links, testimonials, etc.) is centralized in a single config file at the repo root: `site.config.ts`. To rebrand the platform for a new coach, edit that one file and replace the images in `/public`.

## How it works
1. `site.config.ts` — the single source of truth. A typed TypeScript object with all configurable values.
2. `src/lib/config.ts` — re-exports the config as `config` and provides `formatPrice()` helper.
3. `src/components/theme-vars.tsx` — injects CSS custom properties (colors) from config into `:root` at runtime.
4. Every page and component imports `config` from `@/lib/config` instead of hardcoding values.

## Config sections

| Section | What it controls |
|---------|-----------------|
| `brand` | Platform name, taglines, CTA text, copyright holder |
| `coach` | Name, credentials, bio, quote, motivational content, bio bullets |
| `images` | All image paths (coach photo, hero, about, UPI QR, OG image) |
| `achievements` | Landing page stats grid (image, value, label) |
| `testimonials` | Client testimonial cards (image, name, plan, quote, blur) |
| `programs` | Available coaching programs (name, desc, emoji, gradient) |
| `colors` | Primary/accent color, background, foreground (drives CSS vars + PDF colors) |
| `contact` | WhatsApp number, UPI ID, website URL, social media links |
| `pricing` | All tier prices, currency, locale, call price/duration |
| `aboutPlatform` | Feature descriptions, process steps, hero subtitle, disclaimer |
| `seo` | Page title, description, OG/Twitter metadata |

## How to rebrand for a new coach

1. Edit `site.config.ts` — change every value to the new coach's info
2. Replace images in `/public/`:
   - Coach photo (referenced by `images.coachPhoto`)
   - Hero image (referenced by `images.heroImage`)
   - About image (referenced by `images.aboutImage`)
   - UPI QR code (referenced by `images.upiQr`)
   - Testimonial images (referenced by `testimonials[].image`)
   - Achievement images (referenced by `achievements[].image`)
3. Update `.env.local` with the new Supabase project credentials
4. Deploy

## Gotchas
- Colors flow through CSS variables. The `ThemeVars` component in the root layout injects them at runtime from config. The `globals.css` `:root` block has fallback values but they're overridden.
- PDF generation (`pdf-export.ts`, `confirmation-pdf.ts`) uses `config.colors.primaryRgb` for the gold color — this must be an `[R, G, B]` tuple.
- The `globals.css` gradient classes (`.gradient-gold`, `.text-gradient-gold`) use `var(--gold)` and `var(--gold-light)` CSS variables, so they automatically pick up config colors.
- Chart components (`weight-chart.tsx`, `revenue-chart.tsx`, etc.) still have some hardcoded `#d4a853` for Recharts stroke/fill colors. These are the same as the default config value. If you change the primary color, update these too or extract them to use `config.colors.primary`.

## Key files
- `site.config.ts` — the config file (repo root)
- `src/lib/config.ts` — re-export + `formatPrice()` helper
- `src/components/theme-vars.tsx` — CSS variable injection
- `src/app/globals.css` — CSS variables and gradient classes
