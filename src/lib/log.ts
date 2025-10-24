import { supabase } from './supabase'

export interface AuditLogEntry {
  id: string
  created_at: string
  ip_address: string | null
  payload: {
    action: string
    actor_username?: string
    traits?: {
      provider?: string
      user_id?: string
      user_email?: string
    }
  }
}

/**
 * Fetch audit logs via RPC (auto pagination, adaptive limit)
 * - Kalau limit <= 1000 → cuma 1 request
 * - Kalau limit > 1000 → parallel fetch beberapa batch
 */
export async function getAuditLogs(limit = 1000): Promise<AuditLogEntry[]> {
  const batchSize = 1000

  // kasus kecil → langsung sekali fetch
  if (limit <= batchSize) {
    const { data, error } = await supabase.rpc('get_auth_audit_logs', {
      p_limit: limit,
      p_offset: 0,
    })

    if (error) {
      console.error('Error fetching audit logs RPC:', error)
      return []
    }

    console.log(`Fetched ${data?.length || 0} audit logs (single batch).`)
    return data ?? []
  }

  // kasus besar → pecah jadi beberapa batch paralel
  const batchCount = Math.ceil(limit / batchSize)
  const promises = Array.from({ length: batchCount }, (_, i) =>
    supabase.rpc('get_auth_audit_logs', {
      p_limit: batchSize,
      p_offset: i * batchSize,
    })
  )

  const results = await Promise.all(promises)
  const logs = results.flatMap(({ data }) => data ?? [])

  console.log(`Fetched ${logs.length} audit logs in ${batchCount} batches.`)
  return logs.slice(0, limit)
}
