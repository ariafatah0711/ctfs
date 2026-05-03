-- ==============================================
-- Queries: system/common
-- Source: sql/chema.sql
-- ==============================================

REVOKE ALL ON SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

REVOKE UPDATE ON public.users FROM authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.events TO authenticated;
GRANT SELECT ON public.challenges TO authenticated;
GRANT SELECT ON public.solves TO authenticated;
GRANT SELECT ON public.event_admins TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_logs(INT, INT) TO anon;
GRANT SELECT ON public.challenges TO anon;
GRANT SELECT ON public.events TO anon;

CREATE OR REPLACE FUNCTION public.get_auth_audit_logs(
  p_limit int default 50,
  p_offset int default 0
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  ip_address text,
  payload jsonb
)
language sql
security definer
set search_path = public
as $$
  SELECT
    id,
    created_at,
    ip_address::text,
    payload
  FROM auth.audit_log_entries
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

grant execute on function public.get_auth_audit_logs(int, int) to authenticated;
