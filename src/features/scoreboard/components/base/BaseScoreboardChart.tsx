import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/ui/skeleton'
import BaseScoreboardCard from './BaseScoreboardCard'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
})

type ScoreboardChartTrace = {
  x: string[]
  y: number[]
  text: string[]
  hovertemplate: string
  mode: string
  name: string
  line: {
    shape: string
    width: number
  }
  marker: {
    size: number
  }
}

type BaseScoreboardChartProps = {
  title: string
  traces: ScoreboardChartTrace[]
  isDark: boolean
  yAxisTitle?: string
}

const getChartTheme = (isDark: boolean) => ({
  text: isDark ? '#e5e7eb' : '#111827',
  grid: isDark ? 'rgba(55,65,81,0.85)' : 'rgba(229,231,235,0.95)',
  axis: isDark ? '#9ca3af' : '#374151',
  hoverBg: isDark ? '#111622' : '#ffffff',
})

export default function BaseScoreboardChart({
  title,
  traces,
  isDark,
  yAxisTitle = 'Score',
}: BaseScoreboardChartProps) {
  const theme = getChartTheme(isDark)

  return (
    <BaseScoreboardCard
      title={title}
      headerClassName="justify-center border-b-0 pb-1"
      titleClassName="text-center"
      contentClassName="px-3 pt-0 sm:px-5"
    >
      <Plot
        data={traces}
        layout={{
          dragmode: false,
          autosize: true,
          xaxis: {
            type: 'date',
            autorange: true,
            tickfont: { size: 10, color: theme.text },
            tickformat: '%Y-%m-%d %H:%M',
            gridcolor: theme.grid,
            linecolor: theme.axis,
            zerolinecolor: theme.grid,
          },
          yaxis: {
            autorange: true,
            rangemode: 'tozero',
            automargin: true,
            title: { text: yAxisTitle, font: { size: 12, color: theme.text } },
            tickfont: { size: 10, color: theme.text },
            gridcolor: theme.grid,
            linecolor: theme.axis,
            zerolinecolor: theme.grid,
          },
          legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2,
            font: { size: 10, color: theme.text },
          },
          hoverlabel: {
            bgcolor: theme.hoverBg,
            font: { color: theme.text },
          },
          margin: { t: 12, r: 8, l: 28, b: 36 },
          plot_bgcolor: 'transparent',
          paper_bgcolor: 'transparent',
        }}
        style={{ width: '100%', height: '300px' }}
        useResizeHandler
        config={{ scrollZoom: false, displayModeBar: false }}
        className="dark:!bg-transparent dark:!text-gray-100"
      />
    </BaseScoreboardCard>
  )
}
