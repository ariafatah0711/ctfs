import { supabase } from './supabase'

export interface DailyStats {
  date: string;
  solves: number;
  activeUsers: number;
}

export async function getStatsByRange(range: '7d' | '30d' | '90d'): Promise<DailyStats[]> {
  const now = new Date()
  const start = new Date()

  // Set start date based on range
  if (range === '7d') start.setDate(start.getDate() - 7)
  else if (range === '30d') start.setDate(start.getDate() - 30)
  else start.setDate(start.getDate() - 90)

  start.setHours(0, 0, 0, 0)

  // Get solves within date range
  const { data: solves } = await supabase
    .from('solves')
    .select('created_at, user_id')
    .gte('created_at', start.toISOString())
    .lte('created_at', now.toISOString())

  // Group solves by date
  const dailyStats = new Map<string, { solves: number; users: Set<string> }>()

  // Initialize all dates in range
  let currentDate = new Date(start)
  while (currentDate <= now) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dailyStats.set(dateStr, { solves: 0, users: new Set() })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Populate stats
  solves?.forEach(solve => {
    const date = new Date(solve.created_at).toISOString().split('T')[0]
    const stats = dailyStats.get(date)
    if (stats) {
      stats.solves++
      stats.users.add(solve.user_id)
    }
  })

  // Convert to array and sort by date
  return Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      solves: stats.solves,
      activeUsers: stats.users.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
