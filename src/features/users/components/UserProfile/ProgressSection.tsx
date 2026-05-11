'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import APP from '@/config'
import { ChallengeWithSolve } from '@/shared/types'
import { UserEmptyState, UserSection } from '../ui'

type ProgressSectionProps = {
  categoryTotals: { category: string; total_challenges: number }[]
  difficultyTotals: { difficulty: string; total_challenges: number }[]
  solvedChallenges: ChallengeWithSolve[]
}

export default function ProgressSection({
  categoryTotals,
  difficultyTotals,
  solvedChallenges
}: ProgressSectionProps) {
  const visibleCategories = categoryTotals
    .map(({ category, total_challenges }) => {
      const solvedCount = solvedChallenges.filter(c => c.category === category).length
      const progress = total_challenges > 0 ? (solvedCount / total_challenges) * 100 : 0
      return { category, total_challenges, solvedCount, progress }
    })
    .filter(({ solvedCount }) => solvedCount > 0)

  const difficultyOrder = Object.keys(APP.difficultyStyles).map(k => k.toLowerCase())
  const activeDifficulties = difficultyTotals
    .map(({ difficulty, total_challenges }) => ({
      difficulty,
      total_challenges,
      solvedCount: solvedChallenges.filter(c => c.difficulty === difficulty).length,
    }))
    .filter(({ solvedCount, total_challenges }) => total_challenges > 0 && solvedCount > 0)
    .sort((a, b) => {
      const aIndex = difficultyOrder.indexOf(a.difficulty.toLowerCase())
      const bIndex = difficultyOrder.indexOf(b.difficulty.toLowerCase())
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.difficulty.localeCompare(b.difficulty)
    })

  const totalChallenges = activeDifficulties.reduce((sum, d) => sum + d.total_challenges, 0)
  const totalSolved = activeDifficulties.reduce((sum, d) => sum + d.solvedCount, 0)

  return (
    <UserSection
      icon={BarChart3}
      title="Progress"
      description="Solved challenge coverage by category and difficulty."
      contentClassName="space-y-6"
    >
      {visibleCategories.length === 0 ? (
        <UserEmptyState
          icon={BarChart3}
          title="No progress yet"
          description="Solve a challenge to start filling this progress board."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleCategories.map(({ category, total_challenges, solvedCount, progress }) => (
            <div
              key={category}
              className="rounded-xl border border-gray-200 bg-white/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {category}
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {solvedCount}/{total_challenges}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="h-full rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeDifficulties.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Difficulty Progress
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {totalSolved}/{totalChallenges}
            </span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            {activeDifficulties.map(({ difficulty, total_challenges, solvedCount }, index) => {
              const segmentWidth = (total_challenges / totalChallenges) * 100
              const segmentProgress = (solvedCount / total_challenges) * 100

              return (
                <div
                  key={difficulty}
                  className="relative"
                  style={{ width: `${segmentWidth}%` }}
                  title={`${difficulty}: ${solvedCount}/${total_challenges}`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segmentProgress}%` }}
                    transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.05 * index }}
                    className="h-full bg-blue-500"
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeDifficulties.map(({ difficulty, total_challenges, solvedCount }) => (
              <span
                key={difficulty}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400"
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="capitalize">{difficulty}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({solvedCount}/{total_challenges})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </UserSection>
  )
}
