import { BaseScoreboardChart } from '@/features/scoreboard/components/base'
import { TeamProgressSeries } from '../types'

interface TeamScoreboardChartProps {
  series: TeamProgressSeries[]
  isDark: boolean
  scoreLabel?: string
}

const TeamScoreboardChart: React.FC<TeamScoreboardChartProps> = ({ series, isDark, scoreLabel = 'Score' }) => {
  const truncate = (str: string, n: number) => (str.length > n ? `${str.slice(0, n)}...` : str)
  const formatPointText = (shortName: string, score: number, title?: string | null, category?: string | null) => {
    const base = `${shortName} - ${score} ${scoreLabel}`
    if (!title) return base
    return `${base} | ${title}${category ? ` (${category})` : ''}`
  }

  const chartData = series.slice(0, 10).map((entry) => {
    const x = entry.history.map((p) => {
      const date = new Date(p.date)
      const offset = date.getTimezoneOffset() * 60000
      return new Date(date.getTime() - offset).toISOString().slice(0, 16)
    })
    const shortName = truncate(entry.team_name, 16)
    return {
      x,
      y: entry.history.map((p) => p.score),
      text: entry.history.map((p) => formatPointText(shortName, p.score, p.challenge_title, p.challenge_category)),
      hovertemplate: '%{x}<br>%{text}<extra></extra>',
      mode: 'lines+markers',
      name: shortName,
      line: { shape: 'hv', width: 3 },
      marker: { size: 6 },
    }
  })

  return (
    <BaseScoreboardChart
      title="Top 10 Teams"
      traces={chartData}
      isDark={isDark}
      yAxisTitle={scoreLabel}
    />
  )
}

export default TeamScoreboardChart
