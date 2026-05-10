import type { LeaderboardEntry } from '@/shared/types'
import type { LeaderboardSummaryRow, ScoreboardEventParam } from '../types'

export function getScoreboardEventParam(selectedEvent: string): ScoreboardEventParam {
  return selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent
}

export function buildLeaderboardEntries(summary: LeaderboardSummaryRow[]): LeaderboardEntry[] {
  return summary.map((entry, index) => ({
    id: String(index + 1),
    username: entry.username,
    score: entry.score ?? 0,
    rank: index + 1,
    progress: [],
  }))
}

export function applyProgressHistory(
  leaderboard: LeaderboardEntry[],
  topEntries: LeaderboardSummaryRow[],
  progressMap: Record<string, { history?: Array<{ date: string; score: number }> | null }>
) {
  for (let index = 0; index < topEntries.length; index++) {
    const username = topEntries[index].username
    const history = progressMap[username]?.history ?? []
    leaderboard[index].progress = history.map((point) => ({ date: String(point.date), score: point.score }))
    if (history.length > 0) {
      const historyScore = history.at(-1)?.score ?? 0
      leaderboard[index].score = Math.max(leaderboard[index].score ?? 0, historyScore)
    }
  }
}

export function isLeaderboardEmpty(leaderboard: LeaderboardEntry[]) {
  if (leaderboard.length === 0) return true

  const hasProgress = leaderboard.some((entry) => (entry.progress?.length ?? 0) > 0)
  const hasScore = leaderboard.some((entry) => (entry.score ?? 0) > 0)
  return !(hasProgress || hasScore)
}
