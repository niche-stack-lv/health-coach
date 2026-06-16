-- Allow clients (and any authenticated user) to read dish_tags and
-- dish_tag_links so the food check-in picker can show tag filters from
-- their assigned coach's library. Mirrors the existing read access on
-- public.dishes.
CREATE POLICY "Authenticated can read dish tags"
  ON public.dish_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can read dish tag links"
  ON public.dish_tag_links
  FOR SELECT
  TO authenticated
  USING (true);
