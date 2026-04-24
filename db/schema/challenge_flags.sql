-- ==============================================
-- Table: challenge_flags
-- ==============================================

CREATE TABLE public.challenge_flags (
  challenge_id UUID PRIMARY KEY REFERENCES public.challenges(id) ON DELETE CASCADE,
  flag TEXT NOT NULL,
  flag_hash TEXT UNIQUE NOT NULL
);
