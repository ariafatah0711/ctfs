-- ==============================================
-- CTF Schema with Split Flags (Full Reset, Complete)
-- ==============================================

-- DROP semua POLICY otomatis
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I CASCADE;',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END $$;

-- DROP semua FUNCTION di schema public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS funcsig
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE;', r.funcsig);
  END LOOP;
END $$;

-- DROP semua VIEW di schema public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
  LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE;', r.table_name);
  END LOOP;
END $$;

-- DROP semua TRIGGER di schema public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tgname, relname
    FROM pg_trigger
    JOIN pg_class c ON pg_trigger.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE;', r.tgname, r.relname);
  END LOOP;
END $$;


-- DROP EXISTING OBJECTS (reset)
DROP VIEW IF EXISTS public.challenges_with_masked_flag CASCADE;
DROP TABLE IF EXISTS public.challenge_flags CASCADE;
DROP TABLE IF EXISTS public.solves CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ########################################################
-- #################### Extensions ########################
-- ########################################################
-- --------------------------------------------------------

-- ########################################################
-- ####################### Tables #########################
-- ########################################################
-- --------------------------------------------------------
-- ########################################################
-- Table: users
-- ########################################################
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ########################################################
-- Table: challenges
-- ########################################################
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  max_points INTEGER DEFAULT NULL, -- untuk dynamic score
  hint JSONB DEFAULT NULL,
  difficulty TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_dynamic BOOLEAN DEFAULT false,
  min_points INTEGER DEFAULT 0,
  decay_per_solve INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ALTER TABLE public.challenges
-- ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT false,
-- ADD COLUMN IF NOT EXISTS max_points INTEGER DEFAULT NULL,
-- ADD COLUMN IF NOT EXISTS min_points INTEGER DEFAULT 0,
-- ADD COLUMN IF NOT EXISTS decay_per_solve INTEGER DEFAULT 0;
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS total_solves INTEGER DEFAULT 0;

-- ########################################################
-- Table: challenges_flags
-- ########################################################
CREATE TABLE public.challenge_flags (
  challenge_id UUID PRIMARY KEY REFERENCES public.challenges(id) ON DELETE CASCADE,
  flag TEXT NOT NULL,
  flag_hash TEXT UNIQUE NOT NULL
);

-- ########################################################
-- Table: solves
-- ########################################################
CREATE TABLE public.solves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- ########################################################
-- Table: solves_nonactive
-- ########################################################
CREATE TABLE IF NOT EXISTS public.solves_nonactive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT now()  -- waktu dipindahin
);

-- ########################################################
-- #################### Update ########################
-- ########################################################
UPDATE challenges
SET total_solves = (
  SELECT COUNT(*) FROM solves WHERE challenge_id = challenges.id
);

-- ########################################################
-- #################### Functions ########################
-- ########################################################
-- --------------------------------------------------------
-- ########################################################
-- Function: generate_flag_hash(flag_text TEXT)
-- ########################################################
CREATE OR REPLACE FUNCTION generate_flag_hash(flag_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(flag_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ########################################################
-- Function: is_admin()
-- ########################################################
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.users WHERE id = v_user_id;
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ########################################################
-- Function: create_profile(p_id UUID, p_username TEXT)
-- ########################################################
CREATE OR REPLACE FUNCTION create_profile(p_id uuid, p_username text)
RETURNS void AS $$
DECLARE
  v_username text := p_username;
  v_suffix int := 1;
BEGIN
  -- Cari username unik
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = v_username) LOOP
    v_username := p_username || '_' || v_suffix;
    v_suffix := v_suffix + 1;
  END LOOP;

  -- Insert user baru dengan username unik
  INSERT INTO public.users (id, username)
  VALUES (p_id, v_username)
  ON CONFLICT (id) DO NOTHING;

  -- Insert user lain dari auth.users yang belum ada di public.users
  INSERT INTO public.users (id, username)
  SELECT
    au.id,
    COALESCE(
      au.raw_user_meta_data->>'username',
      au.raw_user_meta_data->>'display_name',
      split_part(au.email, '@', 1)
    )
  FROM auth.users au
  LEFT JOIN public.users pu ON pu.id = au.id
  WHERE pu.id IS NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_profile(UUID, TEXT) TO authenticated;

-- ########################################################
-- Function: auto_update_flag_hash()
-- ########################################################
CREATE OR REPLACE FUNCTION auto_update_flag_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.flag_hash = generate_flag_hash(NEW.flag);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_flag_hash ON public.challenge_flags;
CREATE TRIGGER trigger_auto_flag_hash
  BEFORE INSERT OR UPDATE ON public.challenge_flags
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_flag_hash();

-- ########################################################
-- Function: update_challenge_solve_count()
-- ########################################################
CREATE OR REPLACE FUNCTION update_challenge_solve_count()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge_id UUID;
BEGIN
  -- Tentuin challenge_id mana yang harus dihitung
  v_challenge_id := COALESCE(NEW.challenge_id, OLD.challenge_id);

  -- Update total_solves berdasarkan jumlah solve terkini
  UPDATE public.challenges c
  SET total_solves = (
    SELECT COUNT(*) FROM public.solves s WHERE s.challenge_id = v_challenge_id
  )
  WHERE c.id = v_challenge_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger ke tabel solves
DROP TRIGGER IF EXISTS trg_solve_update_count ON public.solves;
CREATE TRIGGER trg_solve_update_count
AFTER INSERT OR DELETE ON public.solves
FOR EACH ROW
EXECUTE FUNCTION update_challenge_solve_count();

-- ########################################################
-- Function: get_email_by_username(p_username TEXT) - ANON
-- ########################################################
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE v_email TEXT;
BEGIN
  SELECT au.email
  INTO v_email
  FROM auth.users au
  JOIN public.users u ON u.id = au.id
  WHERE u.username = p_username;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_email_by_username(text) TO anon, authenticated;

-- ########################################################
-- Function: get_user_profile(p_id UUID)
-- ########################################################
CREATE OR REPLACE FUNCTION get_user_profile(p_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  picture TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    au.raw_user_meta_data->>'picture' AS picture
  FROM public.users u
  LEFT JOIN auth.users au ON au.id = u.id
  WHERE u.id = p_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- ########################################################
-- Function: detail_user(p_id UUID)
-- ########################################################
CREATE OR REPLACE FUNCTION detail_user(p_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_rank BIGINT;
  v_score INT;
  v_solves JSON;
  v_picture TEXT;
BEGIN
  -- Ambil user
  SELECT id, username INTO v_user FROM public.users WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Ambil picture dari auth.users.raw_user_meta_data.picture (jika ada)
  SELECT au.raw_user_meta_data->>'picture' INTO v_picture
  FROM auth.users au
  WHERE au.id = v_user.id;

  -- Hitung rank (sinkron dengan get_leaderboard, tie-break pakai waktu solve terakhir)
  SELECT rank INTO v_rank
  FROM (
    SELECT
      u.id,
      RANK() OVER (ORDER BY COALESCE(SUM(c.points), 0) DESC, MAX(s.created_at) ASC) AS rank
    FROM public.users u
    LEFT JOIN public.solves s ON u.id = s.user_id
    LEFT JOIN public.challenges c ON s.challenge_id = c.id
    GROUP BY u.id
  ) ranked
  WHERE ranked.id = p_id;

  -- Hitung total score user
  SELECT COALESCE(SUM(c.points), 0)
  INTO v_score
  FROM public.solves s
  JOIN public.challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_id;

  -- Register solved challenges
  SELECT json_agg(json_build_object(
    'challenge_id', c.id,
    'title', c.title,
    'category', c.category,
    'points', c.points,
    'difficulty', c.difficulty,
    'solved_at', s.created_at
  ) ORDER BY s.created_at DESC)
  FROM public.solves s
  JOIN public.challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_id
  INTO v_solves;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'rank', COALESCE(v_rank, 0),
      'score', COALESCE(v_score, 0),
      'picture', v_picture
    ),
    'solved_challenges', COALESCE(v_solves, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION detail_user(p_id UUID) TO authenticated;

-- ########################################################
-- Function: update_username(p_id UUID, p_username TEXT)
-- ########################################################
CREATE OR REPLACE FUNCTION update_username(p_id uuid, p_username text)
RETURNS json AS $$
DECLARE
  v_username text := p_username;
  v_old_username text;
  v_exists int;
  v_user_id uuid := auth.uid()::uuid;
BEGIN
  -- Cek user hanya bisa ubah username sendiri
  IF p_id IS DISTINCT FROM v_user_id THEN
    RETURN json_build_object('success', false, 'message', 'Cannot change other user''s username');
  END IF;

  -- Cek user ada
  SELECT username INTO v_old_username FROM public.users WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Cek username sudah dipakai user lain (case-insensitive, kecuali user sendiri)
  SELECT count(*) INTO v_exists FROM public.users WHERE lower(username) = lower(v_username) AND id <> p_id;
  IF v_exists > 0 THEN
    RETURN json_build_object('success', false, 'message', 'Username already taken');
  END IF;

  -- Update username
  UPDATE public.users SET username = v_username, updated_at = now() WHERE id = p_id;
  RETURN json_build_object('success', true, 'username', v_username);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_username(uuid, text) TO authenticated;

-- ########################################################
-- Function: get_leaderboard()
-- ########################################################
CREATE OR REPLACE FUNCTION get_leaderboard(
  limit_rows integer DEFAULT 100,
  offset_rows integer DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  score BIGINT,
  last_solve TIMESTAMPTZ,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    COALESCE(SUM(c.points), 0) AS score,
    MAX(s.created_at) AS last_solve,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(c.points), 0) DESC, MAX(s.created_at) ASC) AS rank
  FROM public.users u
  LEFT JOIN public.solves s ON u.id = s.user_id
  LEFT JOIN public.challenges c ON s.challenge_id = c.id
  GROUP BY u.id, u.username
  ORDER BY score DESC, MAX(s.created_at) ASC
  LIMIT limit_rows OFFSET offset_rows;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_leaderboard(integer, integer) TO authenticated;

-- ########################################################
-- Function: submit_flag(p_challenge_id UUID, p_flag TEXT)
-- ########################################################
CREATE OR REPLACE FUNCTION submit_flag(
  p_challenge_id uuid,
  p_flag text
)
RETURNS json AS $$
DECLARE
  v_user_id uuid := auth.uid()::uuid;
  v_flag_hash TEXT;
  v_points INTEGER;
  v_max_points INTEGER;
  v_is_dynamic BOOLEAN;
  v_min_points INTEGER;
  v_decay_per_solve INTEGER;
  v_solver_count INTEGER;
  v_awarded_points INTEGER;
  v_existing INT;
  v_is_correct BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  SELECT cf.flag_hash, c.points, c.max_points, c.is_dynamic, c.min_points, c.decay_per_solve
    INTO v_flag_hash, v_points, v_max_points, v_is_dynamic, v_min_points, v_decay_per_solve
    FROM challenge_flags cf
    JOIN challenges c ON c.id = cf.challenge_id
    WHERE cf.challenge_id = p_challenge_id;

  IF v_flag_hash IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Challenge not found');
  END IF;

  v_is_correct := encode(digest(p_flag, 'sha256'), 'hex') = v_flag_hash;

  IF NOT v_is_correct THEN
    RETURN json_build_object('success', false, 'message', 'Incorrect flag');
  END IF;

  SELECT count(*) INTO v_existing
  FROM solves
  WHERE user_id = v_user_id AND challenge_id = p_challenge_id;

  IF v_existing > 0 THEN
    RETURN json_build_object('success', true, 'message', 'Correct, but already solved.');
  END IF;

  -- Hitung awarded points (dynamic or static)
  IF v_is_dynamic THEN
    -- Hitung points baru dari max_points
    SELECT COUNT(*) INTO v_solver_count FROM solves WHERE challenge_id = p_challenge_id;
    v_awarded_points := GREATEST(v_min_points, COALESCE(v_max_points, v_points) - v_decay_per_solve * v_solver_count);

    -- Update kolom points di tabel challenges
    UPDATE challenges
    SET points = v_awarded_points
    WHERE id = p_challenge_id;
  ELSE
    v_awarded_points := v_points;
  END IF;

  INSERT INTO solves(user_id, challenge_id) VALUES (v_user_id, p_challenge_id);

  RETURN json_build_object('success', true, 'message', format('Correct! +%s points.', v_awarded_points));
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION submit_flag(uuid, text) TO authenticated;

-- ########################################################
-- Function: add_challenge(...)
-- ########################################################
CREATE OR REPLACE FUNCTION get_flag(p_challenge_id uuid)
RETURNS text AS $$
DECLARE
  v_flag text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can see flag';
  END IF;

  SELECT flag INTO v_flag
  FROM public.challenge_flags
  WHERE challenge_id = p_challenge_id;

  RETURN v_flag;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_flag(p_challenge_id uuid) TO authenticated;

-- ########################################################
-- Function: add_challenge(...)
-- ########################################################
CREATE OR REPLACE FUNCTION add_challenge(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_points INTEGER,
  p_flag TEXT,
  p_difficulty TEXT,
  p_hint JSONB DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]',
  p_is_dynamic BOOLEAN DEFAULT false,
  p_min_points INTEGER DEFAULT 0,
  p_decay_per_solve INTEGER DEFAULT 0,
  p_max_points INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_challenge_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can add challenge';
  END IF;

  INSERT INTO public.challenges(title, description, category, points, max_points, hint, attachments, difficulty, is_active, is_dynamic, min_points, decay_per_solve)
  VALUES (p_title, p_description, p_category, p_points, p_max_points, p_hint, p_attachments, p_difficulty, true, p_is_dynamic, p_min_points, p_decay_per_solve)
  RETURNING id INTO v_challenge_id;

  INSERT INTO public.challenge_flags(challenge_id, flag)
  VALUES (v_challenge_id, p_flag);

  RETURN v_challenge_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_challenge TO authenticated;

-- ########################################################
-- Function: delete_challenge(p_challenge_id UUID)
-- ########################################################
CREATE OR REPLACE FUNCTION delete_challenge(
  p_challenge_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can delete challenge';
  END IF;

  DELETE FROM public.challenges WHERE id = p_challenge_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_challenge(UUID) TO authenticated;

-- ########################################################
-- Function: update_challenge(...)
-- ########################################################
CREATE OR REPLACE FUNCTION update_challenge(
  p_challenge_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_points INTEGER,
  p_difficulty TEXT,
  p_hint JSONB DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]',
  p_is_active BOOLEAN DEFAULT NULL,
  p_flag TEXT DEFAULT NULL,
  p_is_dynamic BOOLEAN DEFAULT false,
  p_min_points INTEGER DEFAULT 0,
  p_decay_per_solve INTEGER DEFAULT 0,
  p_max_points INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_solver_count INT;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can update challenge';
  END IF;

  UPDATE public.challenges
  SET title = p_title,
      description = p_description,
      category = p_category,
      points = p_points,
      max_points = p_max_points,
      difficulty = p_difficulty,
      hint = p_hint,
      attachments = p_attachments,
      is_active = COALESCE(p_is_active, is_active), -- hanya update jika p_is_active tidak NULL
      is_dynamic = p_is_dynamic,
      min_points = p_min_points,
      decay_per_solve = p_decay_per_solve,
      updated_at = now()
  WHERE id = p_challenge_id;

  -- Jika dynamic, update kolom points sesuai rumus
  IF p_is_dynamic THEN
    SELECT COUNT(*) INTO v_solver_count FROM public.solves WHERE challenge_id = p_challenge_id;
    -- Samakan dengan submit_flag: pakai jumlah_solver - 1 (kecuali 0)
    IF v_solver_count > 0 THEN
      v_solver_count := v_solver_count - 1;
    END IF;
    UPDATE public.challenges
    SET points = GREATEST(
        COALESCE(p_min_points, 0),
        COALESCE(p_max_points, 0) - COALESCE(p_decay_per_solve, 0) * v_solver_count
    )
    WHERE id = p_challenge_id;
  END IF;

  IF p_flag IS NOT NULL THEN
    UPDATE public.challenge_flags
    SET flag = p_flag
    WHERE challenge_id = p_challenge_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_challenge(
  uuid, text, text, text, integer, text, jsonb, jsonb, boolean, text, boolean, integer, integer, integer
) TO authenticated;

-- ########################################################

-- Table untuk menampung solve chall nonaktif
CREATE TABLE IF NOT EXISTS public.solves_nonactive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT now()  -- waktu dipindahin
);

-- Trigger function
CREATE OR REPLACE FUNCTION handle_challenge_activation()
RETURNS TRIGGER AS $$
BEGIN
  -- case: challenge dinonaktifin (true → false)
  IF OLD.is_active = true AND NEW.is_active = false THEN
    INSERT INTO public.solves_nonactive (user_id, challenge_id, created_at)
    SELECT user_id, challenge_id, created_at
    FROM public.solves
    WHERE challenge_id = OLD.id;

    DELETE FROM public.solves
    WHERE challenge_id = OLD.id;
  END IF;

  -- case: challenge diaktifin lagi (false → true)
  IF OLD.is_active = false AND NEW.is_active = true THEN
    INSERT INTO public.solves (user_id, challenge_id, created_at)
    SELECT user_id, challenge_id, created_at
    FROM public.solves_nonactive
    WHERE challenge_id = OLD.id
    ON CONFLICT (user_id, challenge_id) DO NOTHING;

    DELETE FROM public.solves_nonactive
    WHERE challenge_id = OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trigger_handle_challenge_activation ON public.challenges;
CREATE TRIGGER trigger_handle_challenge_activation
AFTER UPDATE OF is_active ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION handle_challenge_activation();

-- ########################################################
-- Function: set_challenge_active(p_challenge_id UUID, p_active BOOLEAN)
-- ########################################################
CREATE OR REPLACE FUNCTION set_challenge_active(
  p_challenge_id UUID,
  p_active BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  -- cek admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'message', 'Only admin can change challenge status');
  END IF;

  -- update status chall
  UPDATE public.challenges
  SET is_active = p_active,
      updated_at = now()
  WHERE id = p_challenge_id;

  -- response
  RETURN json_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'is_active', p_active
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_challenge_active(UUID, BOOLEAN) TO authenticated;

-- ########################################################
-- Function: get_category_totals()
-- ########################################################
CREATE OR REPLACE FUNCTION get_category_totals()
RETURNS TABLE (
  category TEXT,
  total_challenges INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.category, COUNT(*)::int
  FROM public.challenges c
  WHERE c.is_active = true
  GROUP BY c.category
  ORDER BY c.category;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_category_totals() TO authenticated;

-- ########################################################
-- Function: get_user_first_bloods(p_user_id UUID)
-- ########################################################
CREATE OR REPLACE FUNCTION get_user_first_bloods(p_user_id UUID)
RETURNS TABLE(challenge_id UUID)
AS $$
BEGIN
  RETURN QUERY
  SELECT t.challenge_id
  FROM (
    SELECT
      s.challenge_id,
      s.user_id,
      ROW_NUMBER() OVER (PARTITION BY s.challenge_id ORDER BY s.created_at ASC, s.id ASC) AS rn
    FROM public.solves s
  ) AS t
  WHERE t.rn = 1 AND t.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_user_first_bloods(UUID) TO authenticated;

-- ########################################################
-- Function: get_notifications(p_limit INT, p_offset INT)
-- ########################################################
CREATE OR REPLACE FUNCTION get_notifications(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  notif_type TEXT,
  notif_challenge_id UUID,
  notif_challenge_title TEXT,
  notif_category TEXT,
  notif_user_id UUID,
  notif_username TEXT,
  notif_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.type,
    t.challenge_id,
    t.challenge_title,
    t.category,
    t.user_id,
    t.username,
    t.created_at
  FROM (
    -- Notifikasi chall baru
    SELECT
      'new_challenge'::text AS type,
      c.id AS challenge_id,
      c.title AS challenge_title,
      c.category,
      NULL::uuid AS user_id,
      NULL::text AS username,
      c.created_at
    FROM public.challenges c
    WHERE c.is_active = true

    UNION ALL

    -- Notifikasi first blood
    SELECT
      'first_blood'::text AS type,
      c.id AS challenge_id,
      c.title AS challenge_title,
      c.category,
      s.user_id,
      u.username,
      s.created_at
    FROM public.challenges c
    JOIN (
      SELECT challenge_id, MIN(created_at) AS first_solve
      FROM public.solves
      GROUP BY challenge_id
    ) fs ON fs.challenge_id = c.id
    JOIN public.solves s ON s.challenge_id = c.id AND s.created_at = fs.first_solve
    JOIN public.users u ON u.id = s.user_id
    WHERE c.is_active = true
  ) t
  ORDER BY t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_notifications(INT, INT) TO authenticated;

-- ########################################################
-- Function: get_solvers_all(p_limit INT, p_offset INT)
-- ########################################################
CREATE OR REPLACE FUNCTION get_solvers_all(
  p_limit INT DEFAULT 250,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  solve_id UUID,
  user_id UUID,
  username TEXT,
  challenge_id UUID,
  challenge_title TEXT,
  solved_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can view all solvers';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    u.id,
    u.username,
    c.id,
    c.title,
    s.created_at
  FROM public.solves s
  JOIN public.users u ON u.id = s.user_id
  JOIN public.challenges c ON c.id = s.challenge_id
  ORDER BY s.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_solvers_all(INT, INT) TO authenticated;

-- ########################################################
-- Function: get_solves_by_name(p_username TEXT)
-- ########################################################
CREATE OR REPLACE FUNCTION get_solves_by_name(
  p_username TEXT
)
RETURNS TABLE (
  solve_id UUID,
  user_id UUID,
  username TEXT,
  challenge_id UUID,
  challenge_title TEXT,
  challenge_category TEXT,
  points INTEGER,
  solved_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can view solves by username';
  END IF;

  RETURN QUERY
  SELECT
    s.id AS solve_id,
    u.id AS user_id,
    u.username,
    c.id AS challenge_id,
    c.title AS challenge_title,
    c.category AS challenge_category,
    c.points,
    s.created_at AS solved_at
  FROM public.solves s
  JOIN public.users u ON u.id = s.user_id
  JOIN public.challenges c ON c.id = s.challenge_id
  WHERE lower(u.username) = lower(p_username)
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_solves_by_name(TEXT) TO authenticated;

-- ########################################################
-- Function: delete_solver(p_solve_id UUID)
-- ########################################################
CREATE OR REPLACE FUNCTION delete_solver(
  p_solve_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  -- cek admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can delete solver';
  END IF;

  DELETE FROM public.solves WHERE id = p_solve_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_solver(UUID) TO authenticated;

-- ########################################################
-- Function: get_info()
-- ########################################################
CREATE OR REPLACE FUNCTION get_info()
RETURNS JSON AS $$
DECLARE
  v_total_users BIGINT;
  v_total_admins BIGINT;
  v_total_solves BIGINT;
  v_unique_solvers BIGINT;
  v_total_challenges BIGINT;
  v_active_challenges BIGINT;
BEGIN
  SELECT COUNT(*)::BIGINT INTO v_total_users FROM public.users;
  SELECT COUNT(*)::BIGINT INTO v_total_admins FROM public.users WHERE is_admin = TRUE;
  SELECT COUNT(*)::BIGINT INTO v_total_solves FROM public.solves;
  SELECT COUNT(DISTINCT user_id)::BIGINT INTO v_unique_solvers FROM public.solves;
  SELECT COUNT(*)::BIGINT INTO v_total_challenges FROM public.challenges;
  SELECT COUNT(*)::BIGINT INTO v_active_challenges FROM public.challenges WHERE is_active = TRUE;

  RETURN json_build_object(
    'total_users', v_total_users,
    'total_admins', v_total_admins,
    'total_solves', v_total_solves,
    'unique_solvers', v_unique_solvers,
    'total_challenges', v_total_challenges,
    'active_challenges', v_active_challenges,
    'success', true
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_info() TO authenticated;

-- ########################################################
-- ################# Security Polices #####################
-- ########################################################
-- --------------------------------------------------------
-- ########################################################
-- Enable RLS
-- ########################################################
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves_nonactive ENABLE ROW LEVEL SECURITY;

-- ########################################################
-- Policies
-- ########################################################
DROP POLICY IF EXISTS "Users can select all" ON public.users;
CREATE POLICY "Users can select all"
  ON public.users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Solves can select all" ON public.solves;
CREATE POLICY "Solves can select all"
  ON public.solves
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Challenges can select all" ON public.challenges;
CREATE POLICY "Challenges can select all"
  ON public.challenges
  FOR SELECT
  USING (true);

-- ########################################################
-- Grant/Revoke Permissions
-- ########################################################
REVOKE ALL ON SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;

REVOKE UPDATE ON public.users FROM authenticated;
GRANT SELECT ON public.challenges TO authenticated;
GRANT SELECT ON public.solves TO authenticated;

-- ########################################################
-- Keep Alive Table
-- ########################################################
DROP TABLE IF EXISTS public."keep-alive" CASCADE;
CREATE TABLE public."keep-alive" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public."keep-alive" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all actions for keep-alive" ON public."keep-alive"
  FOR ALL
  USING (true);

-- ########################################################
-- Initial Admin User Setup
-- ########################################################
-- Admin set manually:
-- UPDATE public.users SET is_admin = true WHERE id = 'your-user-id';


-- ########################################################
-- Function: get_auth_audit_logs(p_limit INT, p_offset INT)
-- ########################################################
create or replace function public.get_auth_audit_logs(
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  created_at timestamptz,
  ip_address text,
  payload jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    id,
    created_at,
    ip_address::text,
    payload
  from auth.audit_log_entries
  order by created_at desc
  limit p_limit offset p_offset;
$$;

grant execute on function public.get_auth_audit_logs(int, int) to authenticated;
