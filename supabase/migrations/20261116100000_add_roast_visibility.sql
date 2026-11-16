-- Roast visibility: private | unlisted | public.
--
-- Existing rows default to 'public' (they were already world-readable), so the
-- currently deployed frontend, which does not know this column, keeps working.
-- The new frontend sets visibility explicitly ('private' by default) on insert.
--
-- SELECT: public and unlisted rows are readable by anyone (unlisted = reachable
-- by link, just not listed on Discover / sitemap — that filtering is done by the
-- queries, not RLS); private rows only by their owner.
-- INSERT/UPDATE/DELETE policies are unchanged (owner-only). The UPDATE policy
-- has no column restriction, so owners can change visibility.

BEGIN;

ALTER TABLE public.roast_profiles
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.roast_profiles'::regclass
      AND conname = 'roast_profiles_visibility_check'
  ) THEN
    ALTER TABLE public.roast_profiles
      ADD CONSTRAINT roast_profiles_visibility_check
      CHECK (visibility IN ('private', 'unlisted', 'public'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_roast_profiles_visibility_created_at
  ON public.roast_profiles (visibility, created_at DESC);

DROP POLICY IF EXISTS "Anyone can view roast profiles" ON public.roast_profiles;
DROP POLICY IF EXISTS "View public, unlisted or own roast profiles" ON public.roast_profiles;
CREATE POLICY "View public, unlisted or own roast profiles"
  ON public.roast_profiles
  FOR SELECT
  USING (visibility IN ('public', 'unlisted') OR auth.uid() = user_id);

COMMIT;
