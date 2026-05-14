import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { LeaderboardEntry } from '@/shared/types'
import { SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS } from '@/shared/styles'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
})

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

  return (
    <Card className={SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white">Top 10 Users</CardTitle>
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
              title: { text: 'Score', font: { size: 12, color: isDark ? '#e5e7eb' : '#111' } },
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

export default ScoreboardChart
