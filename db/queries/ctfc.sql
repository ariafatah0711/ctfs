-- ==============================================
-- Queries: ctfc
-- ==============================================

-- SELECT
CREATE OR REPLACE FUNCTION get_ctfcs(p_challenge_id UUID)
RETURNS SETOF public.ctfc AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.ctfc
  WHERE challenge_id = p_challenge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_ctfcs(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ctfcs(UUID) TO anon;

-- INSERT
CREATE OR REPLACE FUNCTION add_ctfc(
  p_challenge_id UUID,
  p_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_ctfc_id UUID;
BEGIN
  IF NOT can_manage_challenge(p_challenge_id) THEN
    RAISE EXCEPTION 'Only admin can add ctfc service';
  END IF;

  INSERT INTO public.ctfc(challenge_id, name)
  VALUES (p_challenge_id, p_name)
  RETURNING id INTO v_ctfc_id;

  RETURN v_ctfc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_ctfc(UUID, TEXT) TO authenticated;

-- UPDATE
CREATE OR REPLACE FUNCTION update_ctfc(
  p_id UUID,
  p_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_challenge_id UUID;
BEGIN
  SELECT challenge_id INTO v_challenge_id FROM public.ctfc WHERE id = p_id;

  IF v_challenge_id IS NULL THEN
    RAISE EXCEPTION 'CTFC service not found';
  END IF;

  IF NOT can_manage_challenge(v_challenge_id) THEN
    RAISE EXCEPTION 'Only admin can update ctfc service';
  END IF;

  UPDATE public.ctfc
  SET name = p_name,
      updated_at = now()
  WHERE id = p_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_ctfc(UUID, TEXT) TO authenticated;

-- DELETE
CREATE OR REPLACE FUNCTION delete_ctfc(
  p_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_challenge_id UUID;
BEGIN
  SELECT challenge_id INTO v_challenge_id FROM public.ctfc WHERE id = p_id;

  IF v_challenge_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF NOT can_manage_challenge(v_challenge_id) THEN
    RAISE EXCEPTION 'Only admin can delete ctfc service';
  END IF;

  DELETE FROM public.ctfc WHERE id = p_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_ctfc(UUID) TO authenticated;

-- RLS
ALTER TABLE public.ctfc ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ctfc select visible" ON public.ctfc;
CREATE POLICY "Ctfc select visible" ON public.ctfc
FOR SELECT
USING (
  challenge_id IN (SELECT id FROM public.challenges)
);

DROP POLICY IF EXISTS "Ctfc admin manage" ON public.ctfc;
CREATE POLICY "Ctfc admin manage" ON public.ctfc
FOR ALL
USING (
  challenge_id IN (SELECT id FROM public.challenges WHERE can_manage_challenge(id))
);
