-- ==============================================
-- Teams Schema (Team as bridge only)
-- ==============================================

-- ########################################################
-- ####################### Tables #########################
-- ########################################################

DROP TABLE IF EXISTS public.team_members;
DROP TABLE IF EXISTS public.teams;

CREATE TABLE IF NOT EXISTS public.teams (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	invite_code TEXT UNIQUE NOT NULL,
	captain_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
	team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
	user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
	PRIMARY KEY (team_id, user_id)
);

-- Each user can only belong to one team
CREATE UNIQUE INDEX IF NOT EXISTS team_members_user_unique ON public.team_members(user_id);

-- ########################################################
-- ####################### Functions ######################
-- ########################################################

CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT AS $$
BEGIN
	RETURN replace(gen_random_uuid()::text, '-', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if current user is captain of a team
CREATE OR REPLACE FUNCTION is_team_captain(p_team_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_captain_id UUID;
BEGIN
	SELECT captain_user_id INTO v_captain_id
	FROM public.teams
	WHERE id = p_team_id;

	RETURN v_captain_id = v_user_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION is_team_captain(UUID) TO authenticated;

-- Create team (captain = creator)
CREATE OR REPLACE FUNCTION create_team(p_name TEXT)
RETURNS UUID AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user_id) THEN
		RAISE EXCEPTION 'User already in a team';
	END IF;

	INSERT INTO public.teams(name, invite_code, captain_user_id)
	VALUES (p_name, generate_team_invite_code(), v_user_id)
	RETURNING id INTO v_team_id;

	INSERT INTO public.team_members(team_id, user_id)
	VALUES (v_team_id, v_user_id);

	RETURN v_team_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION create_team(TEXT) TO authenticated;

-- Join team by invite code (max 3 members)
CREATE OR REPLACE FUNCTION join_team(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
	v_count INT;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user_id) THEN
		RAISE EXCEPTION 'User already in a team';
	END IF;

	SELECT t.id INTO v_team_id
	FROM public.teams t
	WHERE t.invite_code = p_invite_code;

	IF v_team_id IS NULL THEN
		RAISE EXCEPTION 'Invalid invite code';
	END IF;

	SELECT COUNT(*) INTO v_count
	FROM public.team_members tm
	WHERE tm.team_id = v_team_id;

	IF v_count >= 3 THEN
		RAISE EXCEPTION 'Team is full';
	END IF;

	INSERT INTO public.team_members(team_id, user_id)
	VALUES (v_team_id, v_user_id);

	RETURN v_team_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION join_team(TEXT) TO authenticated;

-- Leave current team
CREATE OR REPLACE FUNCTION leave_team()
RETURNS BOOLEAN AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
	v_captain_id UUID;
	v_count INT;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	SELECT team_id INTO v_team_id
	FROM public.team_members
	WHERE user_id = v_user_id;

	IF v_team_id IS NULL THEN
		RAISE EXCEPTION 'User is not in a team';
	END IF;

	SELECT captain_user_id INTO v_captain_id
	FROM public.teams
	WHERE id = v_team_id;

	SELECT COUNT(*) INTO v_count
	FROM public.team_members
	WHERE team_id = v_team_id;

	IF v_captain_id = v_user_id AND v_count > 1 THEN
		RAISE EXCEPTION 'Captain must transfer captaincy or delete team first';
	END IF;

	IF v_captain_id = v_user_id AND v_count = 1 THEN
		DELETE FROM public.teams WHERE id = v_team_id;
		RETURN TRUE;
	END IF;

	DELETE FROM public.team_members
	WHERE team_id = v_team_id AND user_id = v_user_id;

	RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION leave_team() TO authenticated;

-- Delete team (captain/admin)
CREATE OR REPLACE FUNCTION delete_team(p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
	IF NOT is_admin() AND NOT is_team_captain(p_team_id) THEN
		RAISE EXCEPTION 'Only captain or admin can delete team';
	END IF;

	DELETE FROM public.teams WHERE id = p_team_id;
	RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION delete_team(UUID) TO authenticated;

-- Regenerate invite code (captain/admin)
CREATE OR REPLACE FUNCTION regenerate_team_invite_code(p_team_id UUID)
RETURNS TEXT AS $$
DECLARE
	v_code TEXT;
BEGIN
	IF NOT is_admin() AND NOT is_team_captain(p_team_id) THEN
		RAISE EXCEPTION 'Only captain or admin can regenerate invite code';
	END IF;

	UPDATE public.teams
	SET invite_code = generate_team_invite_code(),
			updated_at = now()
	WHERE id = p_team_id
	RETURNING invite_code INTO v_code;

	RETURN v_code;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION regenerate_team_invite_code(UUID) TO authenticated;

-- Get current user's team (team + members)
DROP FUNCTION IF EXISTS get_my_team();
CREATE OR REPLACE FUNCTION get_my_team(
	p_event_id uuid DEFAULT NULL,
	p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
	v_team JSON;
	v_members JSON;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	SELECT team_id INTO v_team_id
	FROM public.team_members
	WHERE user_id = v_user_id;

	IF v_team_id IS NULL THEN
		RETURN json_build_object('success', true, 'team', NULL, 'members', '[]'::json);
	END IF;

	SELECT json_build_object(
		'id', t.id,
		'name', t.name,
		'invite_code', t.invite_code,
		'created_at', t.created_at
	)
	INTO v_team
	FROM public.teams t
	WHERE t.id = v_team_id;

	WITH team_users AS (
		SELECT tm.user_id, tm.joined_at
		FROM public.team_members tm
		WHERE tm.team_id = v_team_id
	), team_first AS (
		SELECT DISTINCT ON (s.challenge_id)
			s.challenge_id,
			s.user_id,
			s.created_at
		FROM public.solves s
		JOIN team_users tu ON tu.user_id = s.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
		ORDER BY s.challenge_id, s.created_at ASC, s.id ASC
	), user_stats AS (
		SELECT
			tu.user_id,
			COALESCE(SUM(c.points), 0) AS solo_score
		FROM team_users tu
		LEFT JOIN public.solves s ON s.user_id = tu.user_id
		LEFT JOIN public.challenges c ON c.id = s.challenge_id
			AND (
				p_event_mode = 'any'
				OR (p_event_mode = 'main' AND c.event_id IS NULL)
				OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
			)
		GROUP BY tu.user_id
	), first_stats AS (
		SELECT
			tf.user_id,
			COALESCE(COUNT(*), 0) AS first_solves,
			COALESCE(SUM(c.points), 0) AS first_solve_score
		FROM team_first tf
		JOIN public.challenges c ON c.id = tf.challenge_id
		GROUP BY tf.user_id
	)
	SELECT COALESCE(
		json_agg(
			json_build_object(
				'user_id', u.id,
				'username', u.username,
				'role', CASE WHEN u.id = t.captain_user_id THEN 'captain' ELSE 'member' END,
				'joined_at', tm.joined_at,
				'solo_score', COALESCE(us.solo_score, 0),
				'first_solve_count', COALESCE(fs.first_solves, 0),
				'first_solve_score', COALESCE(fs.first_solve_score, 0)
			)
			ORDER BY (u.id = t.captain_user_id) DESC, tm.joined_at ASC
		),
		'[]'::json
	)
	INTO v_members
	FROM public.team_members tm
	JOIN public.users u ON u.id = tm.user_id
	JOIN public.teams t ON t.id = tm.team_id
	LEFT JOIN user_stats us ON us.user_id = tm.user_id
	LEFT JOIN first_stats fs ON fs.user_id = tm.user_id
	WHERE tm.team_id = v_team_id;

	RETURN json_build_object('success', true, 'team', v_team, 'members', v_members);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_my_team(uuid, text) TO authenticated;

-- Get current team's summary (score + counts)
DROP FUNCTION IF EXISTS get_my_team_summary();
CREATE OR REPLACE FUNCTION get_my_team_summary(
	p_event_id uuid DEFAULT NULL,
	p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
	v_team JSON;
	v_unique_score BIGINT := 0;
	v_total_score BIGINT := 0;
	v_unique_challenges INT := 0;
	v_total_solves BIGINT := 0;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	SELECT team_id INTO v_team_id
	FROM public.team_members
	WHERE user_id = v_user_id;

	IF v_team_id IS NULL THEN
		RETURN json_build_object('success', true, 'team', NULL, 'stats', json_build_object(
			'unique_score', 0,
			'total_score', 0,
			'unique_challenges', 0,
			'total_solves', 0
		));
	END IF;

	SELECT json_build_object(
		'id', t.id,
		'name', t.name,
		'invite_code', t.invite_code,
		'created_at', t.created_at
	)
	INTO v_team
	FROM public.teams t
	WHERE t.id = v_team_id;

	WITH team_users AS (
		SELECT user_id FROM public.team_members WHERE team_id = v_team_id
	), solves_filtered AS (
		SELECT s.challenge_id, c.points
		FROM public.solves s
		JOIN team_users tu ON tu.user_id = s.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
	), unique_calc AS (
		SELECT
			COALESCE(SUM(t.points), 0)::BIGINT AS unique_score,
			COALESCE(COUNT(*), 0)::INT AS unique_challenges
		FROM (
			SELECT sf.challenge_id, MAX(sf.points) AS points
			FROM solves_filtered sf
			GROUP BY sf.challenge_id
		) t
	), totals AS (
		SELECT
			COALESCE(SUM(sf.points), 0)::BIGINT AS total_score,
			COALESCE(COUNT(*), 0)::BIGINT AS total_solves
		FROM solves_filtered sf
	)
	SELECT
		uc.unique_score,
		t.total_score,
		uc.unique_challenges,
		t.total_solves
	INTO v_unique_score, v_total_score, v_unique_challenges, v_total_solves
	FROM unique_calc uc
	CROSS JOIN totals t;

	RETURN json_build_object('success', true, 'team', v_team, 'stats', json_build_object(
		'unique_score', v_unique_score,
		'total_score', v_total_score,
		'unique_challenges', v_unique_challenges,
		'total_solves', v_total_solves
	));
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_my_team_summary(uuid, text) TO authenticated;

-- Get current team's solved challenges (unique per team)
DROP FUNCTION IF EXISTS get_my_team_challenges();
CREATE OR REPLACE FUNCTION get_my_team_challenges(
	p_event_id uuid DEFAULT NULL,
	p_event_mode text DEFAULT 'any'
)
RETURNS TABLE (
	challenge_id UUID,
	title TEXT,
	category TEXT,
	points INTEGER,
	first_solved_at TIMESTAMPTZ,
	first_solver_username TEXT
) AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	SELECT team_id INTO v_team_id
	FROM public.team_members
	WHERE user_id = v_user_id;

	IF v_team_id IS NULL THEN
		RETURN;
	END IF;

	RETURN QUERY
	SELECT
		c.id AS challenge_id,
		c.title,
		c.category,
		c.points,
		MIN(s.created_at) AS first_solved_at,
		(
			SELECT u.username
			FROM public.solves s2
			JOIN public.team_members tm2 ON tm2.user_id = s2.user_id
			JOIN public.users u ON u.id = s2.user_id
			JOIN public.challenges c2 ON c2.id = s2.challenge_id
			WHERE tm2.team_id = v_team_id AND s2.challenge_id = c.id
			AND (
				p_event_mode = 'any'
				OR (p_event_mode = 'main' AND c2.event_id IS NULL)
				OR (p_event_id IS NOT NULL AND c2.event_id = p_event_id)
			)
			ORDER BY s2.created_at ASC, s2.id ASC
			LIMIT 1
		) AS first_solver_username
	FROM public.solves s
	JOIN public.team_members tm ON tm.user_id = s.user_id
	JOIN public.challenges c ON c.id = s.challenge_id
	WHERE tm.team_id = v_team_id
	AND (
		p_event_mode = 'any'
		OR (p_event_mode = 'main' AND c.event_id IS NULL)
		OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
	)
	GROUP BY c.id, c.title, c.category, c.points
	ORDER BY first_solved_at DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_my_team_challenges(uuid, text) TO authenticated;

-- Get team by name (public view via RPC)
DROP FUNCTION IF EXISTS get_team_by_name(TEXT);
CREATE OR REPLACE FUNCTION get_team_by_name(
	p_name TEXT,
	p_event_id uuid DEFAULT NULL,
	p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
	v_user_id UUID := auth.uid()::uuid;
	v_team_id UUID;
	v_team JSON;
	v_members JSON;
	v_unique_score BIGINT := 0;
	v_total_score BIGINT := 0;
	v_unique_challenges INT := 0;
	v_total_solves BIGINT := 0;
	v_can_view_invite BOOLEAN := FALSE;
BEGIN
	SELECT id INTO v_team_id
	FROM public.teams
	WHERE lower(name) = lower(p_name)
	LIMIT 1;

	IF v_team_id IS NULL THEN
		RETURN json_build_object('success', false, 'message', 'Team not found');
	END IF;

	IF v_user_id IS NOT NULL THEN
		SELECT EXISTS(
			SELECT 1 FROM public.team_members WHERE team_id = v_team_id AND user_id = v_user_id
		) OR is_admin()
		INTO v_can_view_invite;
	END IF;

	SELECT json_build_object(
		'id', t.id,
		'name', t.name,
		'invite_code', CASE WHEN v_can_view_invite THEN t.invite_code ELSE NULL END,
		'created_at', t.created_at
	)
	INTO v_team
	FROM public.teams t
	WHERE t.id = v_team_id;

	WITH team_users AS (
		SELECT tm.user_id, tm.joined_at
		FROM public.team_members tm
		WHERE tm.team_id = v_team_id
	), team_first AS (
		SELECT DISTINCT ON (s.challenge_id)
			s.challenge_id,
			s.user_id,
			s.created_at
		FROM public.solves s
		JOIN team_users tu ON tu.user_id = s.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
		ORDER BY s.challenge_id, s.created_at ASC, s.id ASC
	), user_stats AS (
		SELECT
			tu.user_id,
			COALESCE(SUM(c.points), 0) AS solo_score
		FROM team_users tu
		LEFT JOIN public.solves s ON s.user_id = tu.user_id
		LEFT JOIN public.challenges c ON c.id = s.challenge_id
			AND (
				p_event_mode = 'any'
				OR (p_event_mode = 'main' AND c.event_id IS NULL)
				OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
			)
		GROUP BY tu.user_id
	), first_stats AS (
		SELECT
			tf.user_id,
			COALESCE(COUNT(*), 0) AS first_solves,
			COALESCE(SUM(c.points), 0) AS first_solve_score
		FROM team_first tf
		JOIN public.challenges c ON c.id = tf.challenge_id
		GROUP BY tf.user_id
	)
	SELECT COALESCE(
		json_agg(
			json_build_object(
				'user_id', u.id,
				'username', u.username,
				'role', CASE WHEN u.id = t.captain_user_id THEN 'captain' ELSE 'member' END,
				'joined_at', tm.joined_at,
				'solo_score', COALESCE(us.solo_score, 0),
				'first_solve_count', COALESCE(fs.first_solves, 0),
				'first_solve_score', COALESCE(fs.first_solve_score, 0)
			)
			ORDER BY (u.id = t.captain_user_id) DESC, tm.joined_at ASC
		),
		'[]'::json
	)
	INTO v_members
	FROM public.team_members tm
	JOIN public.users u ON u.id = tm.user_id
	JOIN public.teams t ON t.id = tm.team_id
	LEFT JOIN user_stats us ON us.user_id = tm.user_id
	LEFT JOIN first_stats fs ON fs.user_id = tm.user_id
	WHERE tm.team_id = v_team_id;

	WITH team_users AS (
		SELECT user_id FROM public.team_members WHERE team_id = v_team_id
	), solves_filtered AS (
		SELECT s.challenge_id, c.points
		FROM public.solves s
		JOIN team_users tu ON tu.user_id = s.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
	), unique_calc AS (
		SELECT
			COALESCE(SUM(t.points), 0)::BIGINT AS unique_score,
			COALESCE(COUNT(*), 0)::INT AS unique_challenges
		FROM (
			SELECT sf.challenge_id, MAX(sf.points) AS points
			FROM solves_filtered sf
			GROUP BY sf.challenge_id
		) t
	), totals AS (
		SELECT
			COALESCE(SUM(sf.points), 0)::BIGINT AS total_score,
			COALESCE(COUNT(*), 0)::BIGINT AS total_solves
		FROM solves_filtered sf
	)
	SELECT
		uc.unique_score,
		t.total_score,
		uc.unique_challenges,
		t.total_solves
	INTO v_unique_score, v_total_score, v_unique_challenges, v_total_solves
	FROM unique_calc uc
	CROSS JOIN totals t;

	RETURN json_build_object(
		'success', true,
		'team', v_team,
		'members', v_members,
		'stats', json_build_object(
			'unique_score', v_unique_score,
			'total_score', v_total_score,
			'unique_challenges', v_unique_challenges,
			'total_solves', v_total_solves
		)
	);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_by_name(TEXT, uuid, text) TO authenticated;

-- Get team solved challenges by team name (public view via RPC)
DROP FUNCTION IF EXISTS get_team_challenges_by_name(TEXT);
CREATE OR REPLACE FUNCTION get_team_challenges_by_name(
	p_name TEXT,
	p_event_id uuid DEFAULT NULL,
	p_event_mode text DEFAULT 'any'
)
RETURNS TABLE (
	challenge_id UUID,
	title TEXT,
	category TEXT,
	points INTEGER,
	first_solved_at TIMESTAMPTZ,
	first_solver_username TEXT
) AS $$
DECLARE
	v_team_id UUID;
BEGIN
	SELECT id INTO v_team_id
	FROM public.teams
	WHERE lower(name) = lower(p_name)
	LIMIT 1;

	IF v_team_id IS NULL THEN
		RETURN;
	END IF;

	RETURN QUERY
	SELECT
		c.id AS challenge_id,
		c.title,
		c.category,
		c.points,
		MIN(s.created_at) AS first_solved_at,
		(
			SELECT u.username
			FROM public.solves s2
			JOIN public.team_members tm2 ON tm2.user_id = s2.user_id
			JOIN public.users u ON u.id = s2.user_id
			JOIN public.challenges c2 ON c2.id = s2.challenge_id
			WHERE tm2.team_id = v_team_id AND s2.challenge_id = c.id
			AND (
				p_event_mode = 'any'
				OR (p_event_mode = 'main' AND c2.event_id IS NULL)
				OR (p_event_id IS NOT NULL AND c2.event_id = p_event_id)
			)
			ORDER BY s2.created_at ASC, s2.id ASC
			LIMIT 1
		) AS first_solver_username
	FROM public.solves s
	JOIN public.team_members tm ON tm.user_id = s.user_id
	JOIN public.challenges c ON c.id = s.challenge_id
	WHERE tm.team_id = v_team_id
	AND (
		p_event_mode = 'any'
		OR (p_event_mode = 'main' AND c.event_id IS NULL)
		OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
	)
	GROUP BY c.id, c.title, c.category, c.points
	ORDER BY first_solved_at DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_challenges_by_name(TEXT, uuid, text) TO authenticated;

-- Team scoreboard (rank by unique challenge score)
DROP FUNCTION IF EXISTS get_team_scoreboard(integer,integer,uuid,text);
CREATE OR REPLACE FUNCTION get_team_scoreboard(
	limit_rows integer DEFAULT 100,
	offset_rows integer DEFAULT 0,
	p_event_id uuid DEFAULT NULL,
	p_event_mode text DEFAULT 'any'
)
RETURNS TABLE (
	team_id UUID,
	team_name TEXT,
	unique_score BIGINT,
	total_score BIGINT,
	unique_challenges BIGINT,
	total_solves BIGINT,
	member_count BIGINT,
	rank BIGINT
) AS $$
BEGIN
	RETURN QUERY
	WITH members_count AS (
		SELECT t.id as team_id, t.name as team_name, COUNT(tm.user_id) as member_count
		FROM public.teams t
		LEFT JOIN public.team_members tm ON tm.team_id = t.id
		GROUP BY t.id, t.name
	),
	solves_filtered AS (
		SELECT tm.team_id AS team_id, s.challenge_id, s.created_at, c.points, c.event_id
		FROM public.team_members tm
		JOIN public.solves s ON s.user_id = tm.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
	),
	agg AS (
		SELECT
			solves_filtered.team_id AS team_id,
			SUM(solves_filtered.points)::BIGINT as total_score,
			COUNT(*)::BIGINT as total_solves,
			COUNT(DISTINCT solves_filtered.challenge_id)::BIGINT as unique_challenges
		FROM solves_filtered
		GROUP BY solves_filtered.team_id
	),
	unique_score_calc AS (
		SELECT t.team_id AS team_id, SUM(t.points)::BIGINT as unique_score
		FROM (
			SELECT solves_filtered.team_id AS team_id, solves_filtered.challenge_id, MAX(solves_filtered.points) as points
			FROM solves_filtered
			GROUP BY solves_filtered.team_id, solves_filtered.challenge_id
		) t
		GROUP BY t.team_id
	)
	SELECT
		mc.team_id,
		mc.team_name,
		COALESCE(us.unique_score, 0) AS unique_score,
		COALESCE(a.total_score, 0) AS total_score,
		COALESCE(a.unique_challenges, 0) AS unique_challenges,
		COALESCE(a.total_solves, 0) AS total_solves,
		COALESCE(mc.member_count, 0) AS member_count,
		RANK() OVER (ORDER BY COALESCE(us.unique_score, 0) DESC) as rank
	FROM members_count mc
	LEFT JOIN agg a ON a.team_id = mc.team_id
	LEFT JOIN unique_score_calc us ON us.team_id = mc.team_id
	ORDER BY COALESCE(us.unique_score, 0) DESC
	LIMIT limit_rows OFFSET offset_rows;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_scoreboard(integer, integer, uuid, text) TO authenticated;

-- Get solves for specific team names (for progress chart)
CREATE OR REPLACE FUNCTION get_team_solves_by_names(p_names TEXT[], p_event_id uuid DEFAULT NULL, p_event_mode text DEFAULT 'any')
RETURNS TABLE (
	team_name TEXT,
	created_at TIMESTAMPTZ,
	points INTEGER
) AS $$
BEGIN
	RETURN QUERY
	SELECT
		t.name AS team_name,
		s.created_at,
		c.points
	FROM public.teams t
	JOIN public.team_members tm ON tm.team_id = t.id
	JOIN public.solves s ON s.user_id = tm.user_id
	JOIN public.challenges c ON c.id = s.challenge_id
	WHERE lower(t.name) = ANY (
		SELECT lower(x) FROM unnest(p_names) AS x
	)
	AND (
		p_event_mode = 'any'
		OR (p_event_mode = 'main' AND c.event_id IS NULL)
		OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
	)
	ORDER BY t.name ASC, s.created_at ASC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_solves_by_names(TEXT[], uuid, text) TO authenticated;

-- Get unique solves for specific team names (for progress chart)
CREATE OR REPLACE FUNCTION get_team_unique_solves_by_names(p_names TEXT[], p_event_id uuid DEFAULT NULL, p_event_mode text DEFAULT 'any')
RETURNS TABLE (
	team_name TEXT,
	created_at TIMESTAMPTZ,
	points INTEGER
) AS $$
BEGIN
	RETURN QUERY
	WITH team_solves AS (
		SELECT
			t.name AS team_name,
			s.challenge_id,
			MIN(s.created_at) AS created_at,
			MAX(c.points) AS points
		FROM public.teams t
		JOIN public.team_members tm ON tm.team_id = t.id
		JOIN public.solves s ON s.user_id = tm.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE lower(t.name) = ANY (
			SELECT lower(x) FROM unnest(p_names) AS x
		)
		AND (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
		GROUP BY t.name, s.challenge_id
	)
	SELECT
		ts.team_name,
		ts.created_at,
		ts.points
	FROM team_solves ts
	ORDER BY ts.team_name ASC, ts.created_at ASC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_unique_solves_by_names(TEXT[], uuid, text) TO authenticated;

-- Get solves for all teams (no name filter) - useful to fetch once instead of per-team calls
CREATE OR REPLACE FUNCTION get_team_solves(p_event_id uuid DEFAULT NULL, p_event_mode text DEFAULT 'any')
RETURNS TABLE (
	team_name TEXT,
	created_at TIMESTAMPTZ,
	points INTEGER
) AS $$
BEGIN
	RETURN QUERY
	SELECT
		t.name AS team_name,
		s.created_at,
		c.points
	FROM public.teams t
	JOIN public.team_members tm ON tm.team_id = t.id
	JOIN public.solves s ON s.user_id = tm.user_id
	JOIN public.challenges c ON c.id = s.challenge_id
	WHERE (
		p_event_mode = 'any'
		OR (p_event_mode = 'main' AND c.event_id IS NULL)
		OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
	)
	ORDER BY t.name ASC, s.created_at ASC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_solves(uuid, text) TO authenticated;

-- Get unique solves for all teams (first solve per challenge per team)
CREATE OR REPLACE FUNCTION get_team_unique_solves(p_event_id uuid DEFAULT NULL, p_event_mode text DEFAULT 'any')
RETURNS TABLE (
	team_name TEXT,
	created_at TIMESTAMPTZ,
	points INTEGER
) AS $$
BEGIN
	RETURN QUERY
	WITH team_solves AS (
		SELECT
			t.name AS team_name,
			s.challenge_id,
			MIN(s.created_at) AS created_at,
			MAX(c.points) AS points
		FROM public.teams t
		JOIN public.team_members tm ON tm.team_id = t.id
		JOIN public.solves s ON s.user_id = tm.user_id
		JOIN public.challenges c ON c.id = s.challenge_id
		WHERE (
			p_event_mode = 'any'
			OR (p_event_mode = 'main' AND c.event_id IS NULL)
			OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
		)
		GROUP BY t.name, s.challenge_id
	)
	SELECT
		ts.team_name,
		ts.created_at,
		ts.points
	FROM team_solves ts
	ORDER BY ts.team_name ASC, ts.created_at ASC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_unique_solves(uuid, text) TO authenticated;

-- Kick member from team (captain/admin)
CREATE OR REPLACE FUNCTION kick_team_member(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
	v_requester UUID := auth.uid()::uuid;
	v_is_member BOOLEAN;
	v_is_captain BOOLEAN;
BEGIN
	IF v_requester IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	IF v_requester = p_user_id THEN
		RAISE EXCEPTION 'Cannot kick yourself';
	END IF;

	SELECT EXISTS(
		SELECT 1 FROM public.team_members
		WHERE team_id = p_team_id AND user_id = p_user_id
	) INTO v_is_member;

	IF NOT v_is_member THEN
		RAISE EXCEPTION 'User not in team';
	END IF;

	v_is_captain := is_team_captain(p_team_id);

	IF NOT is_admin() AND NOT v_is_captain THEN
		RAISE EXCEPTION 'Only captain or admin can kick members';
	END IF;

	DELETE FROM public.team_members
	WHERE team_id = p_team_id AND user_id = p_user_id;

	RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION kick_team_member(UUID, UUID) TO authenticated;

-- Transfer captain to another member (captain/admin)
CREATE OR REPLACE FUNCTION transfer_team_captain(p_team_id UUID, p_new_captain_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
	v_requester UUID := auth.uid()::uuid;
	v_is_member BOOLEAN;
BEGIN
	IF v_requester IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	IF NOT is_admin() AND NOT is_team_captain(p_team_id) THEN
		RAISE EXCEPTION 'Only captain or admin can transfer captain';
	END IF;

	SELECT EXISTS(
		SELECT 1 FROM public.team_members
		WHERE team_id = p_team_id AND user_id = p_new_captain_user_id
	) INTO v_is_member;

	IF NOT v_is_member THEN
		RAISE EXCEPTION 'New captain must be a team member';
	END IF;

	-- Update captain_user_id in teams table
	UPDATE public.teams
	SET captain_user_id = p_new_captain_user_id,
		updated_at = now()
	WHERE id = p_team_id;

	RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION transfer_team_captain(UUID, UUID) TO authenticated;

-- Rename team (captain/admin)
CREATE OR REPLACE FUNCTION rename_team(p_team_id UUID, p_new_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
	v_requester UUID := auth.uid()::uuid;
BEGIN
	IF v_requester IS NULL THEN
		RAISE EXCEPTION 'Not authenticated';
	END IF;

	IF NOT is_admin() AND NOT is_team_captain(p_team_id) THEN
		RAISE EXCEPTION 'Only captain or admin can rename team';
	END IF;

	IF p_new_name IS NULL OR trim(p_new_name) = '' THEN
		RAISE EXCEPTION 'Team name cannot be empty';
	END IF;

	UPDATE public.teams
	SET name = trim(p_new_name),
		updated_at = now()
	WHERE id = p_team_id;

	RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION rename_team(UUID, TEXT) TO authenticated;

-- Get team by user_id (for viewing other users' profiles)
CREATE OR REPLACE FUNCTION get_team_by_user_id(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
	v_team_id UUID;
	v_team JSON;
	v_members JSON;
BEGIN
	SELECT team_id INTO v_team_id
	FROM public.team_members
	WHERE user_id = p_user_id;

	IF v_team_id IS NULL THEN
		RETURN json_build_object('success', true, 'team', NULL, 'members', '[]'::json);
	END IF;

	SELECT json_build_object(
		'id', t.id,
		'name', t.name,
		'invite_code', NULL, -- Don't expose invite code
		'created_at', t.created_at
	)
	INTO v_team
	FROM public.teams t
	WHERE t.id = v_team_id;

	SELECT COALESCE(
		json_agg(
			json_build_object(
				'user_id', u.id,
				'username', u.username,
				'role', CASE WHEN u.id = t.captain_user_id THEN 'captain' ELSE 'member' END,
				'joined_at', tm.joined_at
			)
			ORDER BY (u.id = t.captain_user_id) DESC, tm.joined_at ASC
		),
		'[]'::json
	)
	INTO v_members
	FROM public.team_members tm
	JOIN public.users u ON u.id = tm.user_id
	JOIN public.teams t ON t.id = tm.team_id
	WHERE tm.team_id = v_team_id;

	RETURN json_build_object('success', true, 'team', v_team, 'members', v_members);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION get_team_by_user_id(UUID) TO authenticated;

-- ########################################################
-- ####################### RLS ############################
-- ########################################################

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Only admin can read/write tables directly
DROP POLICY IF EXISTS "Teams admin only" ON public.teams;
CREATE POLICY "Teams admin only"
	ON public.teams
	FOR ALL
	USING (is_admin())
	WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Team members admin only" ON public.team_members;
CREATE POLICY "Team members admin only"
	ON public.team_members
	FOR ALL
	USING (is_admin())
	WITH CHECK (is_admin());
