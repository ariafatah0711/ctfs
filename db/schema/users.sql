-- ==============================================
-- Table: users
-- ==============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  bio TEXT DEFAULT '',
  sosmed JSONB DEFAULT '{}'::jsonb,
  profile_picture_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
