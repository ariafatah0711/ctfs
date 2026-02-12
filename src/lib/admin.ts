import { supabase } from './supabase'

export type AdminScope = {
  is_global_admin: boolean
  event_ids: string[]
}

export type UserLite = {
  id: string
  username: string
  is_admin?: boolean
}

export type EventAdminRow = {
  user_id: string
  username: string
  event_id: string
  event_name: string
  created_at: string
}

// Global admin check only
export async function isGlobalAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return !!data
}

// Global admin OR event admin (scoped)
export async function getAdminScope(): Promise<AdminScope> {
  const { data, error } = await supabase.rpc('get_admin_scope')
  if (error || !data) return { is_global_admin: false, event_ids: [] }

  const is_global_admin = !!(data as any).is_global_admin
  const event_ids_raw = (data as any).event_ids
  const event_ids = Array.isArray(event_ids_raw) ? event_ids_raw.map((x) => String(x)) : []
  return { is_global_admin, event_ids }
}

export async function hasAdminAccess(): Promise<boolean> {
  const scope = await getAdminScope()
  return scope.is_global_admin || scope.event_ids.length > 0
}

// Backwards compatibility: some pages expect isAdmin() boolean
export async function isAdmin(): Promise<boolean> {
  return hasAdminAccess()
}

export async function getGlobalAdmins(): Promise<UserLite[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id,username,is_admin')
    .eq('is_admin', true)
    .order('username', { ascending: true })

  if (error) {
    console.error('Error fetching global admins:', error)
    return []
  }

  return (data || []).map((u: any) => ({ id: String(u.id), username: String(u.username), is_admin: !!u.is_admin }))
}

export async function searchUsersByUsername(query: string, limit = 8): Promise<UserLite[]> {
  const q = (query || '').trim()
  if (!q) return []

  const { data, error } = await supabase
    .from('users')
    .select('id,username,is_admin')
    .ilike('username', `%${q}%`)
    .order('username', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return (data || []).map((u: any) => ({ id: String(u.id), username: String(u.username), is_admin: !!u.is_admin }))
}

export async function getEventAdmins(): Promise<EventAdminRow[]> {
  const { data, error } = await supabase.rpc('get_event_admins')
  if (error) {
    console.error('Error fetching event admins:', error)
    return []
  }

  return (data || []).map((r: any) => ({
    user_id: String(r.user_id),
    username: String(r.username),
    event_id: String(r.event_id),
    event_name: String(r.event_name),
    created_at: String(r.created_at),
  }))
}

export async function grantEventAdmin(userId: string, eventId: string): Promise<{ success: boolean; message?: string }>{
  const { data, error } = await supabase.rpc('grant_event_admin', {
    p_user_id: userId,
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error granting event admin:', error)
    throw error
  }

  const success = !!(data as any)?.success
  const message = (data as any)?.message ? String((data as any).message) : undefined
  return { success, message }
}

export async function revokeEventAdmin(userId: string, eventId: string): Promise<{ success: boolean; deleted?: number; message?: string }>{
  const { data, error } = await supabase.rpc('revoke_event_admin', {
    p_user_id: userId,
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error revoking event admin:', error)
    throw error
  }

  const success = !!(data as any)?.success
  const deleted = typeof (data as any)?.deleted === 'number' ? (data as any).deleted : undefined
  const message = (data as any)?.message ? String((data as any).message) : undefined
  return { success, deleted, message }
}
