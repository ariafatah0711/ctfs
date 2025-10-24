import { supabase } from './supabase'

export interface AuditLogEntry {
  id: string
  instance_id: string
  created_at: string
  ip_address: string
  payload: {
    action: string
    actor_id: string
    actor_username?: string
    actor_via_sso: boolean
    log_type: string
    traits?: {
      provider?: string
      user_id?: string
      user_email?: string
      user_phone?: string
    }
  }
}

/**
 * Fetch audit log entries via RPC.
 * Only admins can access this function.
 * Defaults to most recent 50 rows.
 */
export async function getAuditLogs(limit = 50, offset = 0): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_auth_audit_logs', {
      p_limit: limit,
      p_offset: offset
    })
    // console.log(data || [])

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching audit logs:', err)
    return []
  }
}
