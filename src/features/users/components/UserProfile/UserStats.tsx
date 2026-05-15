"use client"

// React Imports
import React from "react"
import dynamic from "next/dynamic"
import { LayoutGrid, Zap, TrendingUp, BarChart3 } from "lucide-react"

// Shared Imports
import { Skeleton } from "@/shared/ui"
import { useTheme } from "@/shared/contexts"
import { ChallengeWithSolve } from "@/shared/types"
import { UserEmptyState, UserSection } from "../ui"

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
  bg: isDark ? "rgba(17,24,39,0.2)" : "rgba(255,255,255,0.2)",
  text: isDark ? "#e5e7eb" : "#111827",
  grid: isDark ? "rgba(55,65,81,0.8)" : "rgba(229,231,235,0.9)",
})

const pieColors = [
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#93c5fd",
  "#1d4ed8",
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

  // If there are no solves, show a friendly empty state matching UserProfile
  if (!solvedChallenges || solvedChallenges.length === 0) {
    return (
      <UserEmptyState
        icon={BarChart3}
        title="No stat data available"
        description="Solve some challenges to see stats here."
      />
    )
  }

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

  const diffKeys = Object.keys(byDifficulty)
  const diffColors = diffKeys.map((_, index) => pieColors[index % pieColors.length])
  const firstBloodCount = firstBloodIds.length

  const categoriesCount = Object.keys(byCategory).length
  const difficultiesCount = Object.keys(byDifficulty).length

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

  return (
    <div className="space-y-6">
      {/* ================= PIE ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CATEGORY */}
        <UserSection
          title="Solves by Category"
          description={`${categoriesCount} categories represented in your solves.`}
          icon={LayoutGrid}
        >
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
        </UserSection>

        {/* DIFFICULTY */}
        <UserSection
          title="Solves by Difficulty"
          description={`${difficultiesCount} difficulty level${difficultiesCount !== 1 ? 's' : ''} mastered.`}
          icon={Zap}
        >
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
        </UserSection>
      </div>

      {/* ================= LINE ================= */}
      <div>
        <UserSection
          title="Solves Over Time"
          description={`${firstBloodCount} first blood${firstBloodCount !== 1 ? 's' : ''} recorded in this event scope.`}
          icon={TrendingUp}
        >
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
        </UserSection>
      </div>
    </div>
  )
}
