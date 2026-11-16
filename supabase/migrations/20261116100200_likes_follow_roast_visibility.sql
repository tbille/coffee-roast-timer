-- Likes follow the visibility of the roast they belong to.
--
-- Before: SELECT USING (true) exposed likes (roast ids + liker user ids) of
-- private roasts to anyone, and INSERT only checked auth.uid() = user_id, so
-- anyone could like a private roast whose id they knew.
--
-- The EXISTS subquery on roast_profiles runs with the caller's privileges, so it
-- inherits roast_profiles RLS: the roast must be public/unlisted or the caller's
-- own. DELETE (own likes) is unchanged.

BEGIN;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.roast_profile_likes;
DROP POLICY IF EXISTS "View likes of visible roasts" ON public.roast_profile_likes;
CREATE POLICY "View likes of visible roasts"
  ON public.roast_profile_likes
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.roast_profiles p WHERE p.id = roast_profile_id));

DROP POLICY IF EXISTS "Users can create their own likes" ON public.roast_profile_likes;
CREATE POLICY "Users can create their own likes"
  ON public.roast_profile_likes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.roast_profiles p WHERE p.id = roast_profile_id)
  );

COMMIT;
