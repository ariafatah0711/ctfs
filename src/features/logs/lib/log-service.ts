import { supabase } from '@/shared/lib/supabase'

/**
 * Get logs (new challenges & first blood)
 */
export async function getLogs(limit = 100, offset = 0) {
  const { data, error } = await supabase.rpc('get_logs', {
    p_limit: limit,
    p_offset: offset,
  });
  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  return data || [];
}

/**
 * Get recent solves formatted as notifications
 */
export async function getRecentSolves(
  limit = 100,
  offset = 0,
  eventId?: string | null,
  eventMode: 'any' | 'main' | 'event' = 'any'
) {
  const { data, error } = await supabase.rpc('get_recent_solves', {
    p_limit: limit,
    p_offset: offset,
    p_event_id: eventId ?? null,
    p_event_mode: eventMode,
  });

  if (error) {
    console.error('Error fetching recent solves:', error);
    return [];
  }

  return (data as any[]) || [];
}

/**
 * Lightweight activity signal subscription for Logs unread badge.
 * Does NOT fetch extra data; it only signals that something potentially affecting logs happened.
 */
export function subscribeToLogSignals(onSignal: () => void) {
  const solvesChannel = supabase
    .channel('logs-signal-solves')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solves' }, () => {
      onSignal()
    })
    .subscribe()

  const challengesChannel = supabase
    .channel('logs-signal-challenges')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenges' }, (payload) => {
      const row: any = payload.new || {}
      // Only signal on active challenges (matches get_logs WHERE is_active = true)
      if (row.is_active === false) return
      onSignal()
    })
    .subscribe()

  return () => {
    supabase.removeChannel(solvesChannel)
    supabase.removeChannel(challengesChannel)
  }
}
