-- Add daily macro targets to diet_templates.
-- Coaches set these once per template; the client-side check-in / diet plan
-- pages compare actual intake against them. All nullable so existing templates
-- continue to work without targets (UI falls back to showing intake-only).
ALTER TABLE public.diet_templates
  ADD COLUMN IF NOT EXISTS daily_calories integer,
  ADD COLUMN IF NOT EXISTS daily_protein  numeric(6,1),
  ADD COLUMN IF NOT EXISTS daily_carbs    numeric(6,1),
  ADD COLUMN IF NOT EXISTS daily_fat      numeric(6,1),
  ADD COLUMN IF NOT EXISTS daily_fiber    numeric(6,1);
