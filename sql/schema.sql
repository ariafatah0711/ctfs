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
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ==============================================
-- 2. CREATE TABLES
-- ==============================================

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,
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

-- Function to update user score when solve is added
CREATE OR REPLACE FUNCTION update_user_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET score = (
    SELECT COALESCE(SUM(c.points), 0)
    FROM public.solves s
    JOIN public.challenges c ON s.challenge_id = c.id
    WHERE s.user_id = NEW.user_id
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;

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

-- ==============================================
-- 6. CREATE TRIGGERS
-- ==============================================

-- Trigger to update score when solve is added
CREATE TRIGGER trigger_update_user_score
  AFTER INSERT ON public.solves
  FOR EACH ROW
  EXECUTE FUNCTION update_user_score();

-- ==============================================
-- 7. INSERT SAMPLE DATA
-- ==============================================

-- Insert sample challenges
INSERT INTO public.challenges (title, description, category, points, flag, flag_hash, hint, difficulty, attachments) VALUES
('Welcome Challenge', 'Challenge pertama untuk memulai perjalanan CTF Anda. Submit flag yang benar untuk mendapatkan poin!', 'Web', 100, 'hello', '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', 'Flag adalah kata "hello" dalam bahasa Inggris', 'Easy', '[]'::jsonb),
('SQL Injection Basics', 'Pelajari dasar-dasar SQL Injection dengan challenge ini. Temukan cara untuk bypass authentication dan dapatkan flag.', 'Web', 200, 'sqli123', 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', 'Coba inject SQL di form login', 'Medium', '[{"name": "login.php", "url": "https://example.com/files/login.php", "type": "file"}, {"name": "Database Schema", "url": "https://example.com/files/schema.sql", "type": "file"}]'::jsonb),
('Reverse Engineering 101', 'Challenge reverse engineering untuk pemula. Analisis binary dan temukan flag yang tersembunyi.', 'Reverse', 300, 'reverseme', '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', 'Gunakan tools seperti strings atau hex editor', 'Hard', '[{"name": "binary.exe", "url": "https://example.com/files/binary.exe", "type": "file"}, {"name": "Documentation", "url": "https://example.com/docs/reverse-engineering", "type": "link"}]'::jsonb);

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
