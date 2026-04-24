-- ==============================================
-- 03 - Assign Users To Team
-- Simulates user joining teams via app RPC (join_team).
-- ==============================================

-- Reset membership for selected users to keep script repeatable.
DELETE FROM public.team_members
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000104'
);

-- Captains must be members of their own teams.
INSERT INTO public.team_members (team_id, user_id)
VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000104')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- user2 joins team alpha via invite code.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
SELECT join_team('DUMMYTEAMALPHA001');

-- user3 joins team beta via invite code.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
SELECT join_team('DUMMYTEAMBETA0002');

-- Back to admin user context for next scripts.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

SELECT tm.team_id, t.name AS team_name, tm.user_id, u.username
FROM public.team_members tm
JOIN public.teams t ON t.id = tm.team_id
JOIN public.users u ON u.id = tm.user_id
WHERE tm.team_id IN (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000202'
)
ORDER BY t.name, u.username;
