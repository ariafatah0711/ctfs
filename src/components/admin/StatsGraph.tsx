import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ChartData, ChartOptions, Scale, Tick, CoreScaleOptions } from 'chart.js'
import React from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface StatsGraphProps {
  data: {
    date: string;
    solves: number;
    activeUsers: number;
  }[];
  range: '7d' | '30d' | '90d';
  onRangeChange: (range: '7d' | '30d' | '90d') => void;
}

const StatsGraph = ({ data, range, onRangeChange }: StatsGraphProps) => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: range === '7d' ? 'day' : range === '30d' ? 'week' : 'month',
          tooltipFormat: 'PPP',
          displayFormats: {
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy'
          }
        },
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y: {
        min: 0,
        border: {
          display: false
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          padding: 10,
          callback: function (this: Scale<CoreScaleOptions>, tickValue: string | number, _index: number, _ticks: Tick[]) {
            return typeof tickValue === 'number' ? tickValue.toFixed(0) : String(tickValue)
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          color: 'rgb(156, 163, 175)',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgb(17, 24, 39)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        padding: 12,
        boxPadding: 8,
        bodySpacing: 8,
        titleSpacing: 8,
        cornerRadius: 6,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        displayColors: false
      }
    }
  }

  const chartData: ChartData<'line', { x: Date; y: number }[], unknown> = {
    datasets: [
      {
        label: 'Solves',
        data: data.map(d => ({ x: new Date(d.date), y: d.solves })),
        borderColor: 'rgb(99, 102, 241)', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgb(99, 102, 241)',
        pointHoverBorderColor: 'rgb(255, 255, 255)',
        pointHoverBorderWidth: 2,
        fill: true
      },
      {
        label: 'Active Users',
        data: data.map(d => ({ x: new Date(d.date), y: d.activeUsers })),
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgb(34, 197, 94)',
        pointHoverBorderColor: 'rgb(255, 255, 255)',
        pointHoverBorderWidth: 2,
        fill: true
      }
    ]
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <div>
          <h3 className="text-xl font-semibold">Activity Trends</h3>
          <p className="text-sm text-muted-foreground mt-1">Track solves and active users over time</p>
        </div>
        <Select value={range} onValueChange={onRangeChange}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border">
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="pt-6">
        <div className="h-[350px]">
          <Line options={options} data={chartData} />
        </div>
      </div>
    </div>
  )
}

export default StatsGraph
