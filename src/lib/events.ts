import { supabase } from './supabase'
import { Event } from '@/types'

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
  image_url?: string | null
}) {
  const { data, error } = await supabase.rpc('add_event', {
    p_name: payload.name,
    p_description: payload.description ?? '',
    p_start_time: payload.start_time ?? null,
    p_end_time: payload.end_time ?? null,
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
  image_url?: string | null
}) {
  const { data, error } = await supabase.rpc('update_event', {
    p_event_id: eventId,
    p_name: payload.name ?? null,
    p_description: payload.description ?? null,
    p_start_time: payload.start_time ?? null,
    p_end_time: payload.end_time ?? null,
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
