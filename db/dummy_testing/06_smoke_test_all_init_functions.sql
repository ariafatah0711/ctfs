-- ==============================================
-- 06 - Smoke Test All init.sql Functions
-- Goal: ensure all function names from init.sql exist and core RPC calls run.
-- ==============================================

-- Shared IDs used in previous steps.
-- event : 00000000-0000-0000-0000-000000000301
-- teamA : 00000000-0000-0000-0000-000000000201
-- teamB : 00000000-0000-0000-0000-000000000202
-- chall : 00000000-0000-0000-0000-000000000401..403
-- admin : 00000000-0000-0000-0000-000000000101
-- user2 : 00000000-0000-0000-0000-000000000102
-- user5 : 00000000-0000-0000-0000-000000000105
-- user6 : 00000000-0000-0000-0000-000000000106

-- 1) Existence check for all expected public functions from init.sql.
WITH expected(name) AS (
  VALUES
    ('is_admin'),
    ('has_admin_access'),
    ('get_email_by_username'),
    ('get_username_by_email'),
    ('get_user_profile'),
    ('detail_user'),
    ('get_leaderboard'),
    ('get_top_progress'),
    ('get_info'),
    ('get_solve_info'),
    ('create_profile'),
    ('update_username'),
    ('update_bio'),
    ('update_sosmed'),
    ('update_profile_picture'),
    ('cleanup_orphaned_users_and_solves'),
    ('can_manage_event'),
    ('can_manage_challenge'),
    ('get_admin_scope'),
    ('get_event_admins'),
    ('grant_event_admin'),
    ('revoke_event_admin'),
    ('get_flag'),
    ('generate_flag_hash'),
    ('auto_update_flag_hash'),
    ('add_event'),
    ('update_event'),
    ('set_challenges_event'),
    ('delete_event'),
    ('get_category_totals'),
    ('get_difficulty_totals'),
    ('get_user_first_bloods'),
    ('add_challenge'),
    ('submit_flag'),
    ('update_challenge'),
    ('set_challenge_active'),
    ('set_challenge_maintenance'),
    ('update_challenge_solve_count'),
    ('handle_challenge_activation'),
    ('delete_challenge'),
    ('get_logs'),
    ('get_recent_solves'),
    ('get_solvers_all'),
    ('get_solves_by_name'),
    ('get_solves_by_challenge'),
    ('delete_solver'),
    ('generate_team_invite_code'),
    ('is_team_captain'),
    ('get_team_by_name'),
    ('get_team_scoreboard'),
    ('get_team_solves_by_names'),
    ('get_team_unique_solves_by_names'),
    ('get_team_solves'),
    ('get_team_unique_solves'),
    ('get_team_by_user_id'),
    ('create_team'),
    ('regenerate_team_invite_code'),
    ('rename_team'),
    ('delete_team'),
    ('get_my_team'),
    ('get_my_team_summary'),
    ('get_my_team_challenges'),
    ('get_team_challenges_by_name'),
    ('join_team'),
    ('transfer_team_captain'),
    ('leave_team'),
    ('kick_team_member'),
    ('get_notifications'),
    ('create_notification'),
    ('delete_notification'),
    ('get_preview'),
    ('get_auth_audit_logs')
), found AS (
  SELECT DISTINCT p.proname AS name
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
)
SELECT
  e.name,
  CASE WHEN f.name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM expected e
LEFT JOIN found f ON f.name = e.name
ORDER BY e.name;

-- 2) Trigger function presence (cannot be called directly).
SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname IN ('trg_solve_update_count', 'trigger_handle_challenge_activation', 'trigger_auto_flag_hash')
ORDER BY tgname;

-- 3) Runtime smoke checks for core callable functions.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

SELECT is_admin();
SELECT has_admin_access();
SELECT can_manage_event('00000000-0000-0000-0000-000000000301');
SELECT can_manage_challenge('00000000-0000-0000-0000-000000000401');
SELECT get_admin_scope();
SELECT get_event_admins();
SELECT get_user_profile('00000000-0000-0000-0000-000000000101');
SELECT detail_user('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'equals');
SELECT * FROM get_leaderboard(10, 0, '00000000-0000-0000-0000-000000000301', 'equals');
SELECT * FROM get_top_progress(ARRAY['00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000102'::uuid], 100, 0, '00000000-0000-0000-0000-000000000301', 'equals');
SELECT get_info();
SELECT * FROM get_solve_info('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000401');
SELECT get_email_by_username('dummy_user1');
SELECT get_username_by_email('dummy_user1@example.com');

-- profile update functions under own user context
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
SELECT update_username('00000000-0000-0000-0000-000000000102', 'dummy_user2');
SELECT update_bio('00000000-0000-0000-0000-000000000102', 'bio smoke test');
SELECT update_sosmed('00000000-0000-0000-0000-000000000102', '{"github":"dummy_user2"}'::jsonb);
SELECT update_profile_picture('00000000-0000-0000-0000-000000000102', 'https://example.com/avatar2.png');

-- back to admin context
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

-- event admin grant/revoke
SELECT public.grant_event_admin('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000301');
SELECT public.revoke_event_admin('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000301');

-- challenge/flag functions
SELECT get_flag('00000000-0000-0000-0000-000000000401');
SELECT generate_flag_hash('flag{dummy_web_1}');
SELECT * FROM get_category_totals('00000000-0000-0000-0000-000000000301', 'equals');
SELECT * FROM get_difficulty_totals('00000000-0000-0000-0000-000000000301', 'equals');
SELECT * FROM get_user_first_bloods('00000000-0000-0000-0000-000000000101');

-- team functions
SELECT generate_team_invite_code();
SELECT is_team_captain('00000000-0000-0000-0000-000000000201');
SELECT get_team_by_name('dummy_team_alpha', '00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_team_scoreboard(10, 0, '00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_team_solves_by_names(ARRAY['dummy_team_alpha','dummy_team_beta'], '00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_team_unique_solves_by_names(ARRAY['dummy_team_alpha','dummy_team_beta'], '00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_team_solves('00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_team_unique_solves('00000000-0000-0000-0000-000000000301', 'main');
SELECT get_team_by_user_id('00000000-0000-0000-0000-000000000101');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
SELECT get_my_team('00000000-0000-0000-0000-000000000301', 'main');
SELECT get_my_team_summary('00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_my_team_challenges('00000000-0000-0000-0000-000000000301', 'main');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
SELECT * FROM get_team_challenges_by_name('dummy_team_alpha', '00000000-0000-0000-0000-000000000301', 'main');

-- team management no-op/idempotent calls
SELECT rename_team('00000000-0000-0000-0000-000000000201', 'dummy_team_alpha');
SELECT transfer_team_captain('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102');
SELECT transfer_team_captain('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101');

-- logging / admin solve endpoints
SELECT * FROM get_logs(20, 0);
SELECT * FROM get_recent_solves(20, 0);
SELECT * FROM get_solvers_all(20, 0);
SELECT * FROM get_solves_by_name('dummy_user2');
SELECT * FROM get_solves_by_challenge('Dummy Web 1');

-- notifications + preview
SELECT create_notification('Dummy Test', 'Smoke test notification', 'info') AS notification_id;
SELECT * FROM get_notifications(10, 0);
SELECT public.get_preview(10, 10, '00000000-0000-0000-0000-000000000301', 'equals');
SELECT * FROM public.get_auth_audit_logs(5, 0);

-- 4) Destructive/noisy functions are tested inside rollback blocks.
BEGIN;
  -- create/delete event
  WITH e AS (
    SELECT add_event('tmp_event_for_delete', 'tmp', now(), now() + interval '1 day', false, NULL) AS event_id
  )
  SELECT delete_event(event_id) FROM e;
ROLLBACK;

BEGIN;
  -- create/delete challenge
  WITH c AS (
    SELECT add_challenge(
      'tmp challenge for delete',
      'tmp desc',
      'misc',
      50,
      'flag{tmp_delete}',
      'easy',
      NULL,
      '[]'::jsonb,
      false,
      false,
      0,
      0,
      NULL,
      '00000000-0000-0000-0000-000000000301'
    ) AS challenge_id
  )
  SELECT delete_challenge(challenge_id) FROM c;
ROLLBACK;

BEGIN;
  -- create/delete team
  SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000105', true);
  SELECT create_team('tmp_team_delete');
  SELECT delete_team(id)
  FROM public.teams
  WHERE name = 'tmp_team_delete';
ROLLBACK;

BEGIN;
  -- regenerate invite code (tested but reverted)
  SELECT regenerate_team_invite_code('00000000-0000-0000-0000-000000000201');
ROLLBACK;

BEGIN;
  -- join/leave/kick paths
  SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000106', true);
  SELECT join_team('DUMMYTEAMALPHA001');
  SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
  SELECT kick_team_member('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000106');
ROLLBACK;

BEGIN;
  -- leave_team path
  SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000106', true);
  SELECT join_team('DUMMYTEAMBETA0002');
  SELECT leave_team();
ROLLBACK;

BEGIN;
  -- delete_solver on non-existing ID (no-op true)
  SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
  SELECT delete_solver('00000000-0000-0000-0000-000000009999');
ROLLBACK;

BEGIN;
  -- delete_notification
  WITH n AS (
    SELECT create_notification('tmp delete', 'tmp', 'info') AS id
  )
  SELECT delete_notification(id) FROM n;
ROLLBACK;

BEGIN;
  -- set_challenges_event / challenge state / update_challenge
  SELECT set_challenges_event('00000000-0000-0000-0000-000000000301', ARRAY['00000000-0000-0000-0000-000000000401'::uuid]);
  SELECT set_challenge_active('00000000-0000-0000-0000-000000000401', true);
  SELECT set_challenge_maintenance('00000000-0000-0000-0000-000000000401', false);
  SELECT update_challenge(
    '00000000-0000-0000-0000-000000000401',
    'Dummy Web 1',
    'Basic web challenge',
    'web',
    100,
    'easy',
    NULL,
    '[]'::jsonb,
    true,
    false,
    NULL,
    false,
    0,
    0,
    NULL,
    '00000000-0000-0000-0000-000000000301'
  );
ROLLBACK;

BEGIN;
  -- create_profile + cleanup function
  SELECT create_profile('00000000-0000-0000-0000-00000000AAAA', 'dummy_profile_tmp');
  SELECT cleanup_orphaned_users_and_solves();
ROLLBACK;

-- restore admin context at end
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
