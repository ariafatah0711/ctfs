"use client"

import React from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChallengeWithSolve } from "@/types"
import { useTheme } from "@/contexts/ThemeContext"
import APP from "@/config"

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
})

type Props = {
  solvedChallenges: ChallengeWithSolve[]
  firstBloodIds: string[]
  isDark?: boolean
}

/* ===================== THEME ===================== */

const theme = (isDark: boolean) => ({
  bg: isDark ? "#1f2937" : "#ffffff",
  text: isDark ? "#e5e7eb" : "#111827",
  grid: isDark ? "#374151" : "#e5e7eb",
})

const pieColors = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
]

/* ===================== HELPERS ===================== */

function groupSolvesOverTime(solved: ChallengeWithSolve[]) {
  const map: Record<string, number> = {}

  solved.forEach(s => {
    if (!s.solved_at) return
    const d = new Date(s.solved_at).toISOString().slice(0, 10)
    map[d] = (map[d] || 0) + 1
  })

  return Object.keys(map)
    .sort()
    .map(date => ({ date, count: map[date] }))
}

/* ===================== COMPONENT ===================== */

export default function UserStatsPlotly({
  solvedChallenges,
  firstBloodIds,
  isDark,
}: Props) {
  const { theme: currentTheme } = useTheme()
  const isDarkMode = typeof isDark === "boolean" ? isDark : currentTheme === "dark"

  const t = theme(isDarkMode)

  /* ===== CATEGORY ===== */
  const byCategory: Record<string, number> = {}
  solvedChallenges.forEach(s => {
    const c = s.category || "Uncategorized"
    byCategory[c] = (byCategory[c] || 0) + 1
  })

  /* ===== DIFFICULTY ===== */
  const byDifficulty: Record<string, number> = {}
  solvedChallenges.forEach(s => {
    const d = s.difficulty || "Unknown"
    byDifficulty[d] = (byDifficulty[d] || 0) + 1
  })

  // map difficulty labels to colors using APP.difficultyStyles
  const difficultyColorNameToHex: Record<string, string> = {
    cyan: "#60a5fa",
    green: "#34d399",
    yellow: "#fbbf24",
    red: "#f87171",
    purple: "#a78bfa",
  }

  const diffKeys = Object.keys(byDifficulty)
  const diffColors = diffKeys.map(label => {
    const styles = APP?.difficultyStyles || {}
    const matched = Object.keys(styles).find(k => k.toLowerCase() === label.toLowerCase())
    const colorName = matched ? (styles as any)[matched] : undefined
    return (colorName && difficultyColorNameToHex[colorName]) || "#94a3b8"
  })

  const timeSeries = groupSolvesOverTime(solvedChallenges)

  const baseLayout = {
    dragmode: false as const,
    autosize: true,
    paper_bgcolor: t.bg,
    plot_bgcolor: t.bg,
    font: { color: t.text, size: 12 },
    margin: { t: 10, b: 30, l: 40, r: 10 },
    legend: { font: { color: t.text } },
    hoverlabel: {
      bgcolor: isDarkMode ? "#111827" : "#ffffff",
      font: { color: t.text },
    },
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.36 } },
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* ================= PIE ================= */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={item}>
        {/* CATEGORY */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm text-center">
              Solves by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              key={`cat-${isDarkMode}`}
              data={[
                {
                  type: "pie",
                  labels: Object.keys(byCategory),
                  values: Object.values(byCategory),
                  hole: 0.5,
                  marker: {
                    colors: pieColors,
                    line: { color: t.bg, width: 1 },
                  },
                  textinfo: "label+percent",
                  hovertemplate:
                    "%{label}<br>%{value} solves<extra></extra>",
                },
              ]}
              layout={{ ...baseLayout, height: 260 }}
              style={{ width: "100%" }}
              useResizeHandler
              config={{ displayModeBar: false }}
            />
          </CardContent>
        </Card>

        {/* DIFFICULTY */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm text-center">
              Solves by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              key={`diff-${isDarkMode}`}
              data={[
                {
                  type: "pie",
                  labels: Object.keys(byDifficulty),
                  values: Object.values(byDifficulty),
                  hole: 0.5,
                  marker: {
                    colors: diffColors,
                    line: { color: t.bg, width: 1 },
                  },
                  textinfo: "label+percent",
                  hovertemplate:
                    "%{label}<br>%{value} solves<extra></extra>",
                },
              ]}
              layout={{ ...baseLayout, height: 260 }}
              style={{ width: "100%" }}
              useResizeHandler
              config={{ displayModeBar: false }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ================= LINE ================= */}
      <motion.div variants={item}>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-sm text-center">
            Solves Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            key={`line-${isDarkMode}`}
            data={[
              {
                type: "scatter",
                mode: "lines+markers",
                x: timeSeries.map(d => d.date),
                y: timeSeries.map(d => d.count),
                line: { width: 3, color: "#60a5fa" },
                marker: {
                  size: 6,
                  color: "#93c5fd",
                  line: { color: t.bg, width: 1 },
                },
                hovertemplate:
                  "%{x}<br>%{y} solves<extra></extra>",
              },
            ]}
            layout={{
              ...baseLayout,
              height: 300,
              xaxis: { gridcolor: t.grid },
              yaxis: {
                title: { text: "Solves" },
                gridcolor: t.grid,
              },
              showlegend: false,
            }}
            style={{ width: "100%" }}
            useResizeHandler
            config={{ scrollZoom: false, displayModeBar: false }}
          />
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}
