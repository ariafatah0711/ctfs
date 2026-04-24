-- ==============================================
-- 02 - Create Dummy Teams
-- Creates 2 teams with deterministic IDs + invite codes.
-- ==============================================

INSERT INTO public.teams (id, name, invite_code, captain_user_id)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'dummy_team_alpha', 'DUMMYTEAMALPHA001', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000202', 'dummy_team_beta',  'DUMMYTEAMBETA0002', '00000000-0000-0000-0000-000000000104')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  invite_code = EXCLUDED.invite_code,
  captain_user_id = EXCLUDED.captain_user_id,
  updated_at = now();

SELECT id, name, invite_code, captain_user_id
FROM public.teams
WHERE id IN (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000202'
)
ORDER BY name;
