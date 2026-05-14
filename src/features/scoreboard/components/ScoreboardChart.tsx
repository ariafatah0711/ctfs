import { LeaderboardEntry } from '@/shared/types'
import { BaseScoreboardChart } from './base'

interface ScoreboardChartProps {
  leaderboard: LeaderboardEntry[]
  isDark: boolean
}

const ScoreboardChart: React.FC<ScoreboardChartProps> = ({ leaderboard, isDark }) => {
  // Fungsi untuk truncate username
  const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + '...' : str

  const chartData = leaderboard.slice(0, 10).map((entry) => {
    const x = entry.progress.map((point) => {
      const date = new Date(point.date)
      const offset = date.getTimezoneOffset() * 60000
      return new Date(date.getTime() - offset).toISOString().slice(0, 16)
    })
    const shortName = truncate(entry.username, 16)
    return {
      x,
      y: entry.progress.map((point) => point.score),
      text: entry.progress.map((point) => `${shortName} - ${point.score}`),
      hovertemplate: '%{x}<br>%{text}<extra></extra>',
      mode: 'lines+markers',
      name: shortName,
      line: { shape: 'hv', width: 3 },
      marker: { size: 6 },
    }
  })

  return <BaseScoreboardChart title="Top 10 Users" traces={chartData} isDark={isDark} />
}

export default ScoreboardChart
