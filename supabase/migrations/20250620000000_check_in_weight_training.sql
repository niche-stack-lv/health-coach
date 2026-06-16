-- Add a weight_training field to daily food check-ins.
-- Free-text so coaches can store "yes / no / rest" or workout details.
ALTER TABLE public.food_check_ins
  ADD COLUMN IF NOT EXISTS weight_training text;
