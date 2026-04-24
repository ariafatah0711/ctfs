-- ==============================================
-- Table: users
-- ==============================================

CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  bio TEXT DEFAULT '',
  sosmed JSONB DEFAULT '{}'::jsonb,
  profile_picture_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
