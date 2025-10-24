import { supabase } from './supabase'

export interface DailyStats {
  date: string;
  solves: number;
  activeUsers: number;
}

export async function getStatsByRange(range: '7d' | '30d' | '90d'): Promise<DailyStats[]> {
  const now = new Date()
  now.setHours(23, 59, 59, 999) // Set to end of current day

  const start = new Date()
  start.setHours(0, 0, 0, 0) // Set to start of day

  // Set start date based on range and include current day in count
  if (range === '7d') start.setDate(start.getDate() - 6) // 7 days including today
  else if (range === '30d') start.setDate(start.getDate() - 29) // 30 days including today
  else start.setDate(start.getDate() - 89) // 90 days including today

  // Get solves within date range using pagination to avoid server limits
  // We'll fetch in batches (batchSize) and accumulate until less than batchSize
  const batchSize = 1000
  let from = 0
  let allSolves: { created_at: string; user_id: string }[] = []

  while (true) {
    const { data, error } = await supabase
      .from('solves')
      .select('created_at, user_id')
      .gte('created_at', start.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: true })
      .range(from, from + batchSize - 1)

    if (error) {
      console.error('Error fetching solves (paginated):', error)
      break
    }

    if (!data || data.length === 0) break

    allSolves = allSolves.concat(data as { created_at: string; user_id: string }[])

    if (data.length < batchSize) break
    from += batchSize
  }

  const solves = allSolves

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

  // console.log(solves)

  // Convert to array and sort by date
  return Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      solves: stats.solves,
      activeUsers: stats.users.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
