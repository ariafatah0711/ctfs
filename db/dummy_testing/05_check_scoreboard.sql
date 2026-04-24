-- ==============================================
-- 05 - Check Scoreboard And App Views
-- Validates scoreboard-related queries after solve simulation.
-- ==============================================

-- User scoreboard (global/app-like).
SELECT *
FROM get_leaderboard(100, 0, '00000000-0000-0000-0000-000000000301', 'equals');

-- Team scoreboard.
SELECT *
FROM get_team_scoreboard(100, 0, '00000000-0000-0000-0000-000000000301', 'equals');

-- Team progression data.
SELECT *
FROM get_team_solves('00000000-0000-0000-0000-000000000301', 'main');

SELECT *
FROM get_team_unique_solves('00000000-0000-0000-0000-000000000301', 'main');

SELECT *
FROM get_team_solves_by_names(ARRAY['dummy_team_alpha', 'dummy_team_beta'], '00000000-0000-0000-0000-000000000301', 'main');

SELECT *
FROM get_team_unique_solves_by_names(ARRAY['dummy_team_alpha', 'dummy_team_beta'], '00000000-0000-0000-0000-000000000301', 'main');

-- Contextual team endpoints.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
SELECT get_my_team('00000000-0000-0000-0000-000000000301', 'main');
SELECT get_my_team_summary('00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_my_team_challenges('00000000-0000-0000-0000-000000000301', 'main');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
SELECT get_team_by_name('dummy_team_alpha', '00000000-0000-0000-0000-000000000301', 'main');
SELECT * FROM get_team_challenges_by_name('dummy_team_alpha', '00000000-0000-0000-0000-000000000301', 'main');

-- Preview payload for landing page.
SELECT public.get_preview(10, 10, '00000000-0000-0000-0000-000000000301', 'equals');
