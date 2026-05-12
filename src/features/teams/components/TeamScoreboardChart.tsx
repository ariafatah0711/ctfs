import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { TeamProgressSeries } from '../types'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
})

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
    <Card className="bg-white/60 dark:bg-[#111622]/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white">
          Top 10 Teams
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Plot
          data={chartData}
          layout={{
            dragmode: false,
            autosize: true,
            xaxis: {
              type: 'date',
              autorange: true,
              tickfont: { size: 10, color: isDark ? '#e5e7eb' : '#111' },
              tickformat: '%Y-%m-%d %H:%M',
              gridcolor: isDark ? '#374151' : '#e5e7eb',
              linecolor: isDark ? '#e5e7eb' : '#111',
            },
            yaxis: {
              autorange: true,
              rangemode: 'tozero',
              automargin: true,
              title: { text: scoreLabel, font: { size: 12, color: isDark ? '#e5e7eb' : '#111' } },
              tickfont: { size: 10, color: isDark ? '#e5e7eb' : '#111' },
              gridcolor: isDark ? '#374151' : '#e5e7eb',
              linecolor: isDark ? '#e5e7eb' : '#111',
            },
            legend: {
              orientation: 'h',
              x: 0.5,
              xanchor: 'center',
              y: -0.2,
              font: { size: 10, color: isDark ? '#e5e7eb' : '#111' },
            },
            margin: { t: 20, r: 10, l: 30, b: 40 },
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
          }}
          style={{ width: '100%', height: '320px' }}
          useResizeHandler
          config={{ scrollZoom: false, displayModeBar: false }}
          className="dark:!bg-gray-900 dark:!text-gray-100"
        />
      </CardContent>
    </Card>
  )
}

export default TeamScoreboardChart
