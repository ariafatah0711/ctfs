import { supabase } from './supabase'
import { Event, EventJoinRequestRow, EventJoinSettings, EventMembershipStatus } from '@/types'

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data || []
}

export async function addEvent(payload: {
  name: string
  description?: string | null
  start_time?: string | null
  end_time?: string | null
  always_show_challenges?: boolean | null
  image_url?: string | null
}) {
  const { data, error } = await supabase.rpc('add_event', {
    p_name: payload.name,
    p_description: payload.description ?? '',
    p_start_time: payload.start_time ?? null,
    p_end_time: payload.end_time ?? null,
    p_always_show_challenges: payload.always_show_challenges ?? false,
    p_image_url: payload.image_url ?? null,
  })

  if (error) {
    console.error('Error adding event:', error)
    throw error
  }

  return data
}

export async function updateEvent(eventId: string, payload: {
  name?: string | null
  description?: string | null
  start_time?: string | null
  end_time?: string | null
  always_show_challenges?: boolean | null
  image_url?: string | null
}) {
  const { data, error } = await supabase.rpc('update_event', {
    p_event_id: eventId,
    p_name: payload.name ?? null,
    p_description: payload.description ?? null,
    p_start_time: payload.start_time ?? null,
    p_end_time: payload.end_time ?? null,
    p_always_show_challenges: payload.always_show_challenges ?? null,
    p_image_url: payload.image_url ?? null,
  })

  if (error) {
    console.error('Error updating event:', error)
    throw error
  }

  return data
}

export async function deleteEvent(eventId: string) {
  const { data, error } = await supabase.rpc('delete_event', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error deleting event:', error)
    throw error
  }

  return data
}

export async function setChallengesEvent(eventId: string | null, challengeIds: string[]) {
  const { data, error } = await supabase.rpc('set_challenges_event', {
    p_event_id: eventId,
    p_challenge_ids: challengeIds,
  })

  if (error) {
    console.error('Error setting challenges event:', error)
    throw error
  }

  return data
}

export async function getActiveEvents(now: string = new Date().toISOString()): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .or(`start_time.is.null,start_time.lte.${now}`)
    .or(`end_time.is.null,end_time.gte.${now}`)
    .order('start_time', { ascending: true, nullsFirst: true })

  if (error) {
    console.error('Error fetching active events:', error)
    return []
  }

  return data || []
}

function eventHasStarted(event: Event, referenceTimeMs: number) {
  if (event.always_show_challenges) {
    return true
  }

  if (!event.start_time) {
    return true
  }

  const startMs = Date.parse(event.start_time)
  if (Number.isNaN(startMs)) {
    return true
  }

  return startMs <= referenceTimeMs
}

export function filterStartedEvents(events: Event[], referenceTimeMs = Date.now()) {
  return events.filter((event) => eventHasStarted(event, referenceTimeMs))
}

export async function getEventJoinSettings(eventId: string): Promise<EventJoinSettings | null> {
  const { data, error } = await supabase.rpc('get_event_join_settings', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error fetching event join settings:', error)
    return null
  }

  return (data as EventJoinSettings) || null
}

export async function getMyEventMembership(eventId: string): Promise<EventMembershipStatus | null> {
  const { data, error } = await supabase.rpc('get_my_event_membership', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error fetching my event membership:', error)
    return null
  }

  return (data as EventMembershipStatus) || null
}

export async function joinEvent(eventId: string, joinKey?: string | null, note?: string | null) {
  const { data, error } = await supabase.rpc('join_event', {
    p_event_id: eventId,
    p_join_key: joinKey ?? null,
    p_note: note ?? null,
  })

  if (error) {
    console.error('Error joining event:', error)
    throw error
  }

  return data as { success: boolean; status?: string; message?: string }
}

export async function setEventJoinSettings(
  eventId: string,
  joinMode: 'open' | 'request' | 'key',
  joinKey?: string | null
) {
  const { data, error } = await supabase.rpc('set_event_join_settings', {
    p_event_id: eventId,
    p_join_mode: joinMode,
    p_join_key: joinKey ?? null,
  })

  if (error) {
    console.error('Error setting event join settings:', error)
    throw error
  }

  return data as EventJoinSettings
}

export async function regenerateEventJoinKey(eventId: string): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_event_join_key', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error regenerating event join key:', error)
    throw error
  }

  return String(data || '')
}

export async function listEventJoinRequests(
  eventId: string,
  status: 'pending' | 'approved' | 'rejected' | 'any' = 'pending'
): Promise<EventJoinRequestRow[]> {
  const { data, error } = await supabase.rpc('list_event_join_requests', {
    p_event_id: eventId,
    p_status: status,
  })

  if (error) {
    console.error('Error listing event join requests:', error)
    return []
  }

  return (data || []) as EventJoinRequestRow[]
}

export async function reviewEventJoinRequest(requestId: string, approve: boolean) {
  const { data, error } = await supabase.rpc('review_event_join_request', {
    p_request_id: requestId,
    p_approve: approve,
  })

  if (error) {
    console.error('Error reviewing event join request:', error)
    throw error
  }

  return data as { success: boolean; status?: 'approved' | 'rejected'; message?: string }
}
