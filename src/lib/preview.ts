import { supabase } from '@/lib/supabase'

export type PreviewLeaderboardEntry = {
  username: string
  score: number
  last_solve: string | null
  rank: number
}

export type PreviewEvent = {
  id: string
  name: string
  description: string
  start_time: string | null
  end_time: string | null
  image_url: string | null
}

export type PreviewSolveEntry = {
  username: string
  challenge_title: string
  challenge_category?: string | null
  points: number
  solved_at: string
}

export type PreviewData = {
  success: boolean
  total_users: number
  total_solves: number
  leaderboard: PreviewLeaderboardEntry[]
  solves: PreviewSolveEntry[]
  events: PreviewEvent[]
}

export async function getPreviewData(params?: {
  leaderboardLimit?: number
  eventsLimit?: number
  eventId?: string | null | 'all'
}) {
  const leaderboardLimit = params?.leaderboardLimit ?? 25
  const eventsLimit = params?.eventsLimit ?? 10

  // Map frontend eventId values to RPC parameters
  let p_event_mode: string = 'any'
  let p_event_id: string | null = null

  if (params?.eventId === 'all' || params?.eventId === undefined) {
    p_event_mode = 'any'
    p_event_id = null
  } else if (params?.eventId === null) {
    p_event_mode = 'is_null'
    p_event_id = null
  } else {
    p_event_mode = 'equals'
    p_event_id = params?.eventId
  }

  const { data, error } = await supabase.rpc('get_preview', {
    p_leaderboard_limit: leaderboardLimit,
    p_events_limit: eventsLimit,
    p_event_id,
    p_event_mode,
  })

  if (error) {
    console.error('Error fetching preview data:', error)
    return { success: false, total_users: 0, total_solves: 0, leaderboard: [], solves: [], events: [] } satisfies PreviewData
  }

  return (data || { success: false, total_users: 0, total_solves: 0, leaderboard: [], solves: [], events: [] }) as PreviewData
}
