-- ==============================================
-- Table: events
-- ==============================================

CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  always_show_challenges BOOLEAN DEFAULT false,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
