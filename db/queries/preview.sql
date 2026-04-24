-- ==============================================
-- Queries: preview (public landing)
-- Source: sql/preview.sql
-- ==============================================

-- SELECT
DROP FUNCTION IF EXISTS public.get_preview(integer, integer, uuid, text);

CREATE OR REPLACE FUNCTION public.get_preview(
  p_leaderboard_limit integer DEFAULT 25,
  p_events_limit integer DEFAULT 10,
  p_event_id UUID DEFAULT NULL,
  p_event_mode TEXT DEFAULT 'any' -- 'any' | 'equals' | 'is_null'
)
RETURNS JSON AS $$
DECLARE
  v_leaderboard JSON := '[]'::json;
  v_events JSON := '[]'::json;
  v_solves JSON := '[]'::json;
  v_total_users BIGINT := 0;
  v_total_solves BIGINT := 0;
  v_lb_limit INT;
  v_ev_limit INT;
BEGIN
  v_lb_limit := GREATEST(0, LEAST(COALESCE(p_leaderboard_limit, 25), 50));
  v_ev_limit := GREATEST(0, LEAST(COALESCE(p_events_limit, 10), 50));

  IF v_ev_limit > 0 THEN
    SELECT COALESCE(json_agg(row_to_json(e_row)), '[]'::json)
    INTO v_events
    FROM (
      SELECT
        e.id,
        e.name,
        e.description,
        e.start_time,
        e.end_time,
        e.image_url
      FROM public.events e
      ORDER BY e.start_time DESC NULLS LAST, e.created_at DESC
      LIMIT v_ev_limit
    ) e_row;
  END IF;

  SELECT COUNT(*)::BIGINT INTO v_total_users FROM public.users;

  SELECT COUNT(*)::BIGINT
  INTO v_total_solves
  FROM public.solves s
  JOIN public.challenges c ON c.id = s.challenge_id
  WHERE (
    p_event_mode = 'any'
    OR (p_event_mode = 'is_null' AND c.event_id IS NULL)
    OR (p_event_mode = 'equals' AND c.event_id = p_event_id)
  );

  SELECT COALESCE(json_agg(row_to_json(s_row)), '[]'::json)
  INTO v_solves
  FROM (
    SELECT
      u.username,
      c.title AS challenge_title,
      c.category AS challenge_category,
      c.points,
      s.created_at AS solved_at
    FROM public.solves s
    JOIN public.users u ON u.id = s.user_id
    JOIN public.challenges c ON c.id = s.challenge_id
    WHERE (
      p_event_mode = 'any'
      OR (p_event_mode = 'is_null' AND c.event_id IS NULL)
      OR (p_event_mode = 'equals' AND c.event_id = p_event_id)
    )
    ORDER BY s.created_at DESC
    LIMIT 25
  ) s_row;

  IF v_lb_limit > 0 THEN
    SELECT COALESCE(json_agg(row_to_json(lb_row)), '[]'::json)
    INTO v_leaderboard
    FROM (
      SELECT
        t.username,
        t.score,
        t.last_solve,
        ROW_NUMBER() OVER (ORDER BY t.score DESC, t.last_solve ASC) AS rank
      FROM (
        SELECT
          u.username,
          COALESCE(
            SUM(
              CASE WHEN (
                p_event_mode = 'any'
                OR (p_event_mode = 'is_null' AND c.event_id IS NULL)
                OR (p_event_mode = 'equals' AND c.event_id = p_event_id)
              ) THEN c.points ELSE 0 END
            ), 0
          )::BIGINT AS score,
          MAX(
            CASE WHEN (
              p_event_mode = 'any'
              OR (p_event_mode = 'is_null' AND c.event_id IS NULL)
              OR (p_event_mode = 'equals' AND c.event_id = p_event_id)
            ) THEN s.created_at ELSE NULL END
          ) AS last_solve
        FROM public.users u
        JOIN public.solves s ON s.user_id = u.id
        JOIN public.challenges c ON c.id = s.challenge_id
        GROUP BY u.username
        HAVING COALESCE(
          SUM(
            CASE WHEN (
              p_event_mode = 'any'
              OR (p_event_mode = 'is_null' AND c.event_id IS NULL)
              OR (p_event_mode = 'equals' AND c.event_id = p_event_id)
            ) THEN c.points ELSE 0 END
          ), 0
        ) > 0
      ) t
      ORDER BY t.score DESC, t.last_solve ASC
      LIMIT v_lb_limit
    ) lb_row;
  END IF;

  RETURN json_build_object(
    'success', true,
    'total_users', v_total_users,
    'total_solves', v_total_solves,
    'leaderboard', v_leaderboard,
    'solves', v_solves,
    'events', v_events
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.get_preview(integer, integer, uuid, text) TO anon, authenticated;
