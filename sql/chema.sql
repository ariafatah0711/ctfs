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


-- 1. DROP EXISTING OBJECTS (reset)
DROP VIEW IF EXISTS public.challenges_with_masked_flag CASCADE;
DROP TABLE IF EXISTS public.challenge_flags CASCADE;
DROP TABLE IF EXISTS public.solves CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. CREATE TABLES
-- Users table (tanpa email, score, rank)
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Challenges table (metadata only)
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  hint JSONB DEFAULT NULL,
  difficulty TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Challenge flags table (separate, admin-only)
CREATE TABLE public.challenge_flags (
  challenge_id UUID PRIMARY KEY REFERENCES public.challenges(id) ON DELETE CASCADE,
  flag TEXT NOT NULL,
  flag_hash TEXT UNIQUE NOT NULL
);

-- Solves table
CREATE TABLE public.solves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- -- Enable RLS
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.challenge_flags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION generate_flag_hash(flag_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(flag_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.users WHERE id = v_user_id;
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile function (RPC)
CREATE OR REPLACE FUNCTION create_profile(p_id uuid, p_username text)
RETURNS void AS $$
BEGIN
  -- 1. insert untuk user yang baru dipassing
  INSERT INTO public.users (id, username)
  VALUES (p_id, p_username)
  ON CONFLICT (id) DO NOTHING;

  -- 2. insert untuk semua user lain di auth.users yang belum ada di public.users
  INSERT INTO public.users (id, username)
  SELECT
    au.id,
    COALESCE(
      au.raw_user_meta_data->>'username',
      au.raw_user_meta_data->>'display_name',
      split_part(au.email, '@', 1) -- fallback
    )
  FROM auth.users au
  LEFT JOIN public.users pu ON pu.id = au.id
  WHERE pu.id IS NULL; -- cuma yang belum ada
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: detail_user(p_id UUID)
-- Mengembalikan: id, username, rank, solved challenges (id, title, category, points, difficulty, solved_at)
CREATE OR REPLACE FUNCTION detail_user(p_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_rank BIGINT;
  v_solves JSON;
BEGIN
  -- Ambil user
  SELECT id, username INTO v_user FROM public.users WHERE id = p_id;
  IF NOT FOUND THEN
  RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Hitung rank (berdasarkan jumlah solve, urutan waktu solve tercepat)
  SELECT COALESCE(rank, 0) FROM (
    SELECT u.id, CASE WHEN COUNT(s.id) = 0 THEN 0 ELSE ROW_NUMBER() OVER (ORDER BY COUNT(s.id) DESC, MIN(s.created_at) ASC) END AS rank
    FROM public.users u
    LEFT JOIN public.solves s ON u.id = s.user_id
    GROUP BY u.id
  ) ranked WHERE ranked.id = p_id INTO v_rank;

  -- Daftar solved challenges
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
      'rank', v_rank
    ),
    'solved_challenges', COALESCE(v_solves, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leaderboard: urutkan berdasarkan jumlah solve
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id UUID,
  username TEXT,
  solves INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    COUNT(s.id) as solves,
    ROW_NUMBER() OVER (ORDER BY COUNT(s.id) DESC, MIN(s.created_at) ASC) as rank
  FROM public.users u
  LEFT JOIN public.solves s ON u.id = s.user_id
  GROUP BY u.id, u.username
  ORDER BY solves DESC, MIN(s.created_at) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit flag function
CREATE OR REPLACE FUNCTION submit_flag(
  p_challenge_id uuid,
  p_flag text
)
RETURNS json AS $$
DECLARE
  v_user_id uuid := auth.uid()::uuid;
  v_flag_hash text;
  v_points int;
  v_existing int;
  v_is_correct boolean;
BEGIN
  IF v_user_id IS NULL THEN
  RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  SELECT cf.flag_hash, c.points
  INTO v_flag_hash, v_points
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


  INSERT INTO solves(user_id, challenge_id) VALUES (v_user_id, p_challenge_id);

  RETURN json_build_object('success', true, 'message', format('Correct! +%s points.', v_points));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_challenge(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_points INTEGER,
  p_flag TEXT,
  p_difficulty TEXT,
  p_hint JSONB DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_challenge_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can add challenge';
  END IF;

  INSERT INTO public.challenges(title, description, category, points, hint, attachments, difficulty, is_active)
  VALUES (p_title, p_description, p_category, p_points, p_hint, p_attachments, p_difficulty, true)
  RETURNING id INTO v_challenge_id;

  INSERT INTO public.challenge_flags(challenge_id, flag)
  VALUES (v_challenge_id, p_flag);

  RETURN v_challenge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_challenge(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, JSONB, JSONB) TO authenticated;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_challenge(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION update_challenge(
  p_challenge_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_points INTEGER,
  p_difficulty TEXT,
  p_hint JSONB DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]',
  p_is_active BOOLEAN DEFAULT TRUE,
  p_flag TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can update challenge';
  END IF;

  UPDATE public.challenges
  SET title = p_title,
    description = p_description,
    category = p_category,
    points = p_points,
    difficulty = p_difficulty,
    hint = p_hint,
    attachments = p_attachments,
    is_active = p_is_active,
    updated_at = now()
  WHERE id = p_challenge_id;

  IF p_flag IS NOT NULL THEN
    UPDATE public.challenge_flags
    SET flag = p_flag
    WHERE challenge_id = p_challenge_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_challenge(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT, JSONB, JSONB, BOOLEAN, TEXT) TO authenticated;

-- ########################################################

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;

-- POLICY: semua user boleh SELECT users, solves, challenges
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

-- POLICY: blokir SELECT tabel lain (tidak dibuat policy SELECT, otomatis ditolak)

-- POLICY: blokir INSERT/UPDATE/DELETE langsung, hanya boleh lewat function
DROP POLICY IF EXISTS "No direct insert users" ON public.users;
CREATE POLICY "No direct insert users" ON public.users FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct delete users" ON public.users;
CREATE POLICY "No direct delete users" ON public.users FOR DELETE USING (false);

DROP POLICY IF EXISTS "No direct insert challenges" ON public.challenges;
CREATE POLICY "No direct insert challenges" ON public.challenges FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct update challenges" ON public.challenges;
CREATE POLICY "No direct update challenges" ON public.challenges FOR UPDATE USING (false);
DROP POLICY IF EXISTS "No direct delete challenges" ON public.challenges;
CREATE POLICY "No direct delete challenges" ON public.challenges FOR DELETE USING (false);

DROP POLICY IF EXISTS "No direct insert challenge_flags" ON public.challenge_flags;
CREATE POLICY "No direct insert challenge_flags" ON public.challenge_flags FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct update challenge_flags" ON public.challenge_flags;
CREATE POLICY "No direct update challenge_flags" ON public.challenge_flags FOR UPDATE USING (false);
DROP POLICY IF EXISTS "No direct delete challenge_flags" ON public.challenge_flags;
CREATE POLICY "No direct delete challenge_flags" ON public.challenge_flags FOR DELETE USING (false);

DROP POLICY IF EXISTS "No direct insert solves" ON public.solves;
CREATE POLICY "No direct insert solves" ON public.solves FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "No direct update solves" ON public.solves;
CREATE POLICY "No direct update solves" ON public.solves FOR UPDATE USING (false);
DROP POLICY IF EXISTS "No direct delete solves" ON public.solves;
CREATE POLICY "No direct delete solves" ON public.solves FOR DELETE USING (false);

-- GRANTS
REVOKE ALL ON SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

GRANT USAGE ON SCHEMA public TO authenticated;

-- Hanya boleh update kolom username, bukan is_admin
REVOKE UPDATE ON public.users FROM authenticated;

GRANT SELECT ON public.challenges TO authenticated;
GRANT SELECT ON public.solves TO authenticated;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_by_username(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION detail_user(p_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION submit_flag(uuid, text) TO authenticated;

-- Admin set manually:
-- UPDATE public.users SET is_admin = true WHERE id = 'your-user-id';

-- Insert sample challenges (flag_hash akan auto-generate dari trigger)
-- Insert Base64 challenge
WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'Base64',
    'Flag disembunyikan sebagai Base64. Cari string yang sudah di-encode dan decode untuk mendapatkan flag. YXJpYQo=',
    'Cryptography',
    150,
    '["Flag adalah Base64 dari nama domain target."]',
    'Easy',
    '[]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'aria', encode(digest('aria', 'sha256'), 'hex')
FROM ins;

-- Insert Robots challenge
WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'Robots',
    'Flag disembunyikan di file `robots.txt` pada domain target. Buka `https://smk.amablex90.my.id/robots.txt` dan cari baris yang menyimpan flag.',
    'Web',
    100,
    '["Cek https://smk.amablex90.my.id/robots.txt — flag ada di sana."]',
    'Easy',
    '[
      {
        "url": "https://smk.amablex90.my.id",
        "name": "https://smk.amablex90.my.id",
        "type": "link"
      }
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{robots_txt_leaked_the_secret}', encode(digest('flag{robots_txt_leaked_the_secret}', 'sha256'), 'hex')
FROM ins;

-- Insert Hidden Flag challenge
WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'Hidden Flag in HTML',
    'Hidden Flag in HTML',
    'Web',
    100,
    NULL,
    'Easy',
    '[
      {
        "url": "https://ariaf.my.id/ctf_quest/web/easy/hidden_flag/index.html",
        "name": "https://ariaf.my.id/ctf_quest/web/easy/hidden_flag/index.html",
        "type": "link"
      }
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'CWA{hidden_in_plain_sight}', encode(digest('CWA{hidden_in_plain_sight}', 'sha256'), 'hex')
FROM ins;


WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'ada udang dibalik batu',
    'ini test doang: flag{test}',
    'Web',
    200,
    '["test"]',
    'Medium',
    '[
      {
        "url": "https://raw.githubusercontent.com/ariafatah0711/ctf_quest/refs/heads/main/Forensics/medium/ada_udang_dibalik_pixe/chall.png",
        "name": "chall.png",
        "type": "file"
      }
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test}', encode(digest('flag{test}', 'sha256'), 'hex')
FROM ins;
