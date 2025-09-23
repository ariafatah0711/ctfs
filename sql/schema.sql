-- CTFS Database Schema (Complete Version)
-- Jalankan script ini di Supabase SQL Editor untuk setup database lengkap
-- Script ini aman dijalankan berulang kali (idempotent)

-- ==============================================
-- 1. DROP EXISTING OBJECTS (untuk reset)
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can insert challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can update challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can delete challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view all solves" ON public.solves;
DROP POLICY IF EXISTS "Users can insert own solves" ON public.solves;

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_user_score ON public.solves;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_user_score() CASCADE;
DROP FUNCTION IF EXISTS get_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;

-- Drop existing tables
DROP TABLE IF EXISTS public.solves CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ==============================================
-- 2. CREATE TABLES
-- ==============================================

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER, -- langsung ditambah di sini
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  flag TEXT NOT NULL, -- Plain text flag (for admin viewing)
  flag_hash TEXT UNIQUE NOT NULL, -- SHA256 hash of the flag (for validation)
  hint TEXT, -- Optional hint untuk challenge
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of attachments: [{"name": "file.py", "url": "https://...", "type": "file"}]
  difficulty TEXT DEFAULT 'Easy', -- Easy, Medium, Hard
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solves table
CREATE TABLE public.solves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id) -- Prevent duplicate solves
);

-- ==============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE RLS POLICIES
-- ==============================================

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Authenticated users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id AND auth.role() = 'authenticated');

-- RLS Policies for challenges table
CREATE POLICY "Anyone can view challenges" ON public.challenges
  FOR SELECT USING (true);

-- Admin policies for challenges
CREATE POLICY "Admins can insert challenges" ON public.challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update challenges" ON public.challenges
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete challenges" ON public.challenges
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for solves table
CREATE POLICY "Users can view all solves" ON public.solves
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own solves" ON public.solves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- 5. CREATE FUNCTIONS
-- ==============================================

-- Function untuk update ulang score user
CREATE OR REPLACE FUNCTION update_user_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET score = (
    SELECT COALESCE(SUM(c.points), 0)
    FROM public.solves s
    JOIN public.challenges c ON s.challenge_id = c.id
    WHERE s.user_id = COALESCE(NEW.user_id, OLD.user_id) -- support insert & delete
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION recalc_scores_for_challenge()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users u
  SET score = (
    SELECT COALESCE(SUM(c.points), 0)
    FROM public.solves s
    JOIN public.challenges c ON s.challenge_id = c.id
    WHERE s.user_id = u.id
  ),
  updated_at = NOW()
  WHERE EXISTS (
    SELECT 1 FROM public.solves s WHERE s.challenge_id = COALESCE(NEW.id, OLD.id) AND s.user_id = u.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id UUID,
  username TEXT,
  score INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.score,
    ROW_NUMBER() OVER (ORDER BY u.score DESC, u.created_at ASC) as rank
  FROM public.users u
  ORDER BY u.score DESC, u.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk check admin status
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk generate SHA256 hash dari flag
CREATE OR REPLACE FUNCTION generate_flag_hash(flag_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(flag_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function untuk auto-update flag_hash saat flag diubah
CREATE OR REPLACE FUNCTION auto_update_flag_hash()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate hash dari flag yang baru
  NEW.flag_hash = generate_flag_hash(NEW.flag);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function untuk update rank semua user
CREATE OR REPLACE FUNCTION update_all_user_ranks()
RETURNS void AS $$
DECLARE
  rec RECORD;
  i INTEGER := 1;
BEGIN
  FOR rec IN
    SELECT id FROM public.users
    ORDER BY score DESC, created_at ASC
  LOOP
    UPDATE public.users SET rank = i WHERE id = rec.id;
    i := i + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. CREATE TRIGGERS
-- ==============================================

-- Saat solve baru ditambah → update score
DROP TRIGGER IF EXISTS trigger_update_user_score_insert ON public.solves;
CREATE TRIGGER trigger_update_user_score_insert
  AFTER INSERT ON public.solves
  FOR EACH ROW
  EXECUTE FUNCTION update_user_score();

-- Saat solve dihapus → update score
DROP TRIGGER IF EXISTS trigger_update_user_score_delete ON public.solves;
CREATE TRIGGER trigger_update_user_score_delete
  AFTER DELETE ON public.solves
  FOR EACH ROW
  EXECUTE FUNCTION update_user_score();

-- Recalculate score semua user yang solved challenge tsb kalau challenge diubah
DROP TRIGGER IF EXISTS trigger_update_score_challenge_update ON public.challenges;
CREATE TRIGGER trigger_update_score_challenge_update
  AFTER UPDATE OR DELETE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION recalc_scores_for_challenge();

-- Trigger untuk auto-generate flag_hash saat flag diinsert/update
DROP TRIGGER IF EXISTS trigger_auto_flag_hash ON public.challenges;
CREATE TRIGGER trigger_auto_flag_hash
  BEFORE INSERT OR UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_flag_hash();

-- Trigger: update rank setiap score user berubah
CREATE OR REPLACE FUNCTION after_user_score_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_all_user_ranks();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_ranks ON public.users;
CREATE TRIGGER trigger_update_user_ranks
  AFTER UPDATE OF score ON public.users
  FOR EACH STATEMENT
  EXECUTE FUNCTION after_user_score_update();

-- ==============================================
-- 7. INSERT SAMPLE DATA
-- ==============================================

-- Insert sample challenges (flag_hash akan auto-generate dari trigger)
INSERT INTO public.challenges (title, description, category, points, flag, hint, difficulty, attachments)
VALUES
(
  'Base64',
  'Flag disembunyikan sebagai Base64. Cari string yang sudah di-encode dan decode untuk mendapatkan flag.\ YXJpYQo=',
  'Cryptography',
  150,
  'aria',
  'Flag adalah Base64 dari nama domain target.',
  'Easy',
  '[]'::jsonb
),
(
  'Robots',
  'Flag disembunyikan di file `robots.txt` pada domain target. Buka `https://smk.amablex90.my.id/robots.txt` dan cari baris yang menyimpan flag.',
  'Web',
  100,
  'flag{robots_txt_leaked_the_secret}',
  'Cek https://smk.amablex90.my.id/robots.txt — flag ada di sana.',
  'Easy',
  '[
    {
      "url": "https://smk.amablex90.my.id",
      "name": "https://smk.amablex90.my.id",
      "type": "link"
    }
  ]'::jsonb
),
(
  'Hidden Flag in HTML',
  'Hidden Flag in HTML',
  'Web',
  100,
  'CWA{hidden_in_plain_sight}',
  NULL,
  'Easy',
  '[
    {
      "url": "https://ariaf.my.id/ctf_quest/web/easy/hidden_flag/index.html",
      "name": "https://ariaf.my.id/ctf_quest/web/easy/hidden_flag/index.html",
      "type": "link"
    }
  ]'::jsonb
),
(
  'ada udang dibalik batu',
  'ini test doang: flag{test}',
  'Web',
  200,
  'flag{test}',
  'test',
  'Medium',
  '[
    {
      "url": "https://raw.githubusercontent.com/ariafatah0711/ctf_quest/refs/heads/main/Forensics/medium/ada_udang_dibalik_pixe/chall.png",
      "name": "chall.png",
      "type": "file"
    }
  ]'::jsonb
);

-- ==============================================
-- 8. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.challenges TO anon, authenticated;
GRANT ALL ON public.solves TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;

-- ==============================================
-- 9. SET ADMIN USER (OPTIONAL)
-- ==============================================

-- Uncomment dan ganti dengan user ID yang benar untuk set admin
-- UPDATE public.users SET is_admin = true WHERE id = 'your-user-id-here';

-- ==============================================
-- 10. VERIFICATION QUERIES
-- ==============================================

-- Cek apakah semua tabel sudah dibuat
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'challenges', 'solves')
ORDER BY table_name;

-- Cek sample data
SELECT id, title, category, points, flag, difficulty, is_active
FROM public.challenges
ORDER BY points ASC;

-- Cek admin function
SELECT is_admin() as current_user_is_admin;

-- ==============================================
-- SCRIPT SELESAI!
-- ==============================================

-- Untuk set user sebagai admin, jalankan query ini:
-- UPDATE public.users SET is_admin = true WHERE id = 'your-user-id-here';
