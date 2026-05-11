'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ListChecks, LockKeyhole, Sparkles, X } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogTitle } from '@/shared/ui'
import { formatRelativeDate } from '@/shared/lib'
import { DIALOG_CONTENT_CLASS_3XL } from '@/shared/styles'
import { ChallengeWithSolve } from '@/shared/types'
import { UserEmptyState, UserSection } from '../ui'

type SolvedChallengesProps = {
  solvedChallenges: ChallengeWithSolve[]
  firstBloodIds: string[]
  showAllModal: boolean
  setShowAllModal: (show: boolean) => void
  onShowUnsolved: () => void
}

export default function SolvedChallenges({
  solvedChallenges,
  firstBloodIds,
  showAllModal,
  setShowAllModal,
  onShowUnsolved
}: SolvedChallengesProps) {
  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onShowUnsolved}
        className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
      >
        <LockKeyhole className="h-3.5 w-3.5" />
        Show Unsolved
      </Button>
      {solvedChallenges.length > 10 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAllModal(true)}
          className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
        >
          <ListChecks className="h-3.5 w-3.5" />
          Show All
        </Button>
      )}
    </div>
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <UserSection
        icon={CheckCircle2}
        title="Recent Solved Challenges"
        description="A compact view of the latest completed challenges."
        action={actions}
        contentClassName="space-y-3"
      >
        {solvedChallenges.length === 0 ? (
          <UserEmptyState
            icon={CheckCircle2}
            title="No solved challenges yet"
            description="Solved challenges will appear here."
          />
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {solvedChallenges.slice(0, 10).map((challenge) => (
                <ChallengeRow
                  key={challenge.id}
                  challenge={challenge}
                  firstBlood={firstBloodIds.includes(challenge.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </UserSection>

      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className={DIALOG_CONTENT_CLASS_3XL + ' fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden border-gray-200 bg-white/90 p-0 backdrop-blur-xl dark:border-gray-800 dark:bg-[#111827]/95'}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              All Solved Challenges
            </DialogTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAllModal(false)}
              className="rounded-full text-gray-500 hover:bg-blue-500/10 hover:text-blue-500 dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-5">
            {solvedChallenges.length === 0 ? (
              <UserEmptyState
                icon={CheckCircle2}
                title="No solved challenges yet"
                description="Solved challenges will appear here."
              />
            ) : (
              <div className="max-h-[70vh] space-y-3 overflow-y-auto scroll-hidden pr-1">
                {solvedChallenges.map((challenge) => (
                  <ChallengeRow
                    key={challenge.id}
                    challenge={challenge}
                    firstBlood={firstBloodIds.includes(challenge.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function ChallengeRow({
  challenge,
  firstBlood,
}: {
  challenge: ChallengeWithSolve
  firstBlood: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-white/80 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-gray-800/80 sm:flex-row sm:items-center"
    >
      <div className="min-w-0">
        <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <span className="truncate">{challenge.title}</span>
          {firstBlood && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3 w-3" />
              First Blood
            </span>
          )}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {challenge.category} / {challenge.difficulty} / {challenge.solved_at ? formatRelativeDate(challenge.solved_at) : '-'}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400">
        +{challenge.points}
      </span>
    </motion.div>
  )
}
