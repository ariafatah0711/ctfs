-- ==============================================
-- Table: ctfc
-- ==============================================

CREATE TABLE public.ctfc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ctfc_challenge_id ON public.ctfc(challenge_id);
