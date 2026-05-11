'use client'

import React, { useMemo } from 'react'
import { LockKeyhole, X } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogTitle } from '@/shared/ui'
import { Loader } from '@/shared/components/custom'
import { DIALOG_CONTENT_CLASS_3XL } from '@/shared/styles'
import APP from '@/config'
import { UserEmptyState } from '../ui'

type UnsolvedChallengesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  unsolvedChallenges: any[]
}

export default function UnsolvedChallengesModal({
  open,
  onOpenChange,
  loading,
  unsolvedChallenges
}: UnsolvedChallengesModalProps) {
  const unsolvedByCategory = useMemo(() => {
    return unsolvedChallenges.reduce((acc, challenge) => {
      if (!acc[challenge.category]) {
        acc[challenge.category] = []
      }
      acc[challenge.category].push(challenge)
      return acc
    }, {} as Record<string, any[]>)
  }, [unsolvedChallenges])

  const orderedUnsolvedCategories = useMemo(() => {
    const preferredOrder = (typeof APP !== 'undefined' && APP.challengeCategories) ? APP.challengeCategories : []
    const categories = Object.keys(unsolvedByCategory)
    const matchedCategorySet = new Set<string>()

    return [
      ...preferredOrder.flatMap(p => {
        const pLower = p.toLowerCase()
        const found = categories.find(c => {
          const cLower = c.toLowerCase()
          return cLower.includes(pLower) || pLower.includes(cLower)
        })
        if (found && !matchedCategorySet.has(found)) {
          matchedCategorySet.add(found)
          return found
        }
        return [] as string[]
      }),
      ...categories.filter(c => !matchedCategorySet.has(c)).sort()
    ]
  }, [unsolvedByCategory])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONTENT_CLASS_3XL + ' fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden border-gray-200 bg-white/90 p-0 backdrop-blur-xl dark:border-gray-800 dark:bg-[#111827]/95'}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Unsolved Challenges
          </DialogTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-gray-500 hover:bg-blue-500/10 hover:text-blue-500 dark:text-gray-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader color="text-blue-500" />
            </div>
          ) : unsolvedChallenges.length === 0 ? (
            <UserEmptyState
              icon={LockKeyhole}
              title="All challenges completed"
              description="No available unsolved challenges in this event scope."
            />
          ) : (
            <div className="max-h-[70vh] space-y-5 overflow-y-auto scroll-hidden pr-1">
              {orderedUnsolvedCategories.map(category => {
                const challengeList = unsolvedByCategory[category]

                return (
                  <section key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        {category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {challengeList.length} {challengeList.length === 1 ? 'challenge' : 'challenges'}
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {challengeList.map((challenge: any) => (
                        <div
                          key={challenge.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white/40 p-3 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-white/80 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-gray-800/80 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-semibold text-gray-900 dark:text-white">
                                {challenge.title}
                              </span>
                              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                {challenge.difficulty}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {challenge.points} pts / {challenge.total_solves || 0} solves
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
