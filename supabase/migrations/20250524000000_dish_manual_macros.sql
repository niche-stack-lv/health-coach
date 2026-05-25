-- Add manual_macros flag to dishes table
-- When true, macros are entered directly without food items
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS manual_macros boolean DEFAULT false;
