-- Add multilingual support columns for games table
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS tutorial_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tutorial_es JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Ensure existing rows have non-null tutorial arrays
UPDATE public.games
SET
  tutorial_en = COALESCE(tutorial_en, '[]'::jsonb),
  tutorial_es = COALESCE(tutorial_es, '[]'::jsonb);
