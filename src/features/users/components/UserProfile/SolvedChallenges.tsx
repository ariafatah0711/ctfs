'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ListChecks, Target, Sparkles } from 'lucide-react'
import {
  BaseModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@/shared/components/custom'
import { Button } from '@/shared/ui'
import { formatRelativeDate } from '@/shared/lib'
import type { ChallengeWithSolve } from '@/shared/types'
import { UserEmptyState, UserSection } from '../ui'
import ProfileChallengeListItem from './ProfileChallengeListItem'

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
        <Target className="h-3.5 w-3.5" />
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

      <BaseModal open={showAllModal} onOpenChange={setShowAllModal} size="3xl">
        <ModalHeader
          title="All Solved Challenges"
          actions={(
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAllModal(false)
                onShowUnsolved()
              }}
              className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
            >
              <Target className="h-3.5 w-3.5" />
              Show Unsolved
            </Button>
          )}
        />

        <ModalBody>
          {solvedChallenges.length === 0 ? (
            <UserEmptyState
              icon={CheckCircle2}
              title="No solved challenges yet"
              description="Solved challenges will appear here."
            />
          ) : (
            <div className="space-y-3">
              {solvedChallenges.map((challenge) => (
                <ChallengeRow
                  key={challenge.id}
                  challenge={challenge}
                  firstBlood={firstBloodIds.includes(challenge.id)}
                />
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAllModal(false)}
            className="border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
          >
            Close
          </Button>
        </ModalFooter>
      </BaseModal>
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
    >
      <ProfileChallengeListItem
        title={challenge.title}
        titleBadge={firstBlood ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3 w-3" />
            First Blood
          </span>
        ) : null}
        subtitle={
          <p className="truncate">
            {challenge.category} / {challenge.difficulty} / {challenge.solved_at ? formatRelativeDate(challenge.solved_at) : '-'}
          </p>
        }
        trailing={(
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400">
            +{challenge.points}
          </span>
        )}
      />
    </motion.div>
  )
}
