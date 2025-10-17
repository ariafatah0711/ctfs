-- CREATE POLICY "Only admin on solves_nonactive"
--   ON public.solves_nonactive
--   USING (is_admin())
--   WITH CHECK (is_admin());

-- POLICY: blokir SELECT tabel lain (tidak dibuat policy SELECT, otomatis ditolak)

-- POLICY: blokir INSERT/UPDATE/DELETE langsung, hanya boleh lewat function
-- DROP POLICY IF EXISTS "No direct insert users" ON public.users;
-- CREATE POLICY "No direct insert users" ON public.users FOR INSERT WITH CHECK (false);
-- DROP POLICY IF EXISTS "No direct delete users" ON public.users;
-- CREATE POLICY "No direct delete users" ON public.users FOR DELETE USING (false);

DROP POLICY IF EXISTS "No direct insert challenges" ON public.challenges;
CREATE POLICY "No direct insert challenges" ON public.challenges FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct update challenges" ON public.challenges;
CREATE POLICY "No direct update challenges" ON public.challenges FOR UPDATE USING (false);
DROP POLICY IF EXISTS "No direct delete challenges" ON public.challenges;
CREATE POLICY "No direct delete challenges" ON public.challenges FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "No direct insert challenge_flags" ON public.challenge_flags;
-- CREATE POLICY "No direct insert challenge_flags" ON public.challenge_flags FOR INSERT WITH CHECK (false);
-- DROP POLICY IF EXISTS "No direct update challenge_flags" ON public.challenge_flags;
-- CREATE POLICY "No direct update challenge_flags" ON public.challenge_flags FOR UPDATE USING (false);
-- DROP POLICY IF EXISTS "No direct delete challenge_flags" ON public.challenge_flags;
-- CREATE POLICY "No direct delete challenge_flags" ON public.challenge_flags FOR DELETE USING (false);

DROP POLICY IF EXISTS "No direct insert solves" ON public.solves;
CREATE POLICY "No direct insert solves" ON public.solves FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct update solves" ON public.solves;
CREATE POLICY "No direct update solves" ON public.solves FOR UPDATE USING (false);
DROP POLICY IF EXISTS "No direct delete solves" ON public.solves;
CREATE POLICY "No direct delete solves" ON public.solves FOR DELETE USING (false);
