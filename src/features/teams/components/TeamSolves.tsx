'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Trophy, ListChecks, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/components'
import { DIALOG_CONTENT_CLASS_3XL, SURFACE_GLASS_BASE_CLASS } from '@/shared/styles'
import { TeamChallenge } from '../types'
import { formatDate } from '../lib/team-utils'
import ProfileChallengeListItem from '@/features/users/components/UserProfile/ProfileChallengeListItem'

interface TeamSolvesProps {
  challenges: TeamChallenge[]
  title?: string
}

export default function TeamSolves({
  challenges,
  title = 'Recent Team Solves',
}: TeamSolvesProps) {
  const [showAllSolves, setShowAllSolves] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-500" />
          {title}
        </h2>

        {challenges.length > 10 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAllSolves(true)}
            className="text-blue-500 hover:text-blue-600 font-bold text-xs uppercase tracking-wider"
          >
            Show All <ListChecks size={14} className="ml-1" />
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {challenges.length === 0 ? (
          <Card className={`${SURFACE_GLASS_BASE_CLASS} rounded-2xl`}>
            <CardContent className="pt-6">
              <EmptyState
                icon={<Trophy className="w-full h-full text-gray-400" />}
                title="No solves yet"
                description="Challenges solved by your team will appear here."
                containerHeight="py-8"
              />
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {challenges.slice(0, 10).map((c) => (
              <TeamSolveRow key={c.challenge_id} challenge={c} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <Dialog open={showAllSolves} onOpenChange={setShowAllSolves}>
        <DialogContent className={DIALOG_CONTENT_CLASS_3XL + " fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !rounded-3xl border-none p-0 overflow-hidden"}>
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-10">
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">
              All Team Solves ({challenges.length})
            </DialogTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowAllSolves(false)}
              className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
            >
              ✕
            </Button>
          </div>

          <div className="p-8 pt-4">
            {challenges.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">No solves yet.</div>
            ) : (
              <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2 scroll-hidden">
                {challenges.map((c) => (
                  <TeamSolveRow key={c.challenge_id} challenge={c} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamSolveRow({ challenge }: { challenge: TeamChallenge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <ProfileChallengeListItem
        title={challenge.title}
        subtitle={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-blue-500/80">{challenge.category}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span>Solved {formatDate(challenge.first_solved_at)}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="italic">by <span className="font-bold text-gray-700 dark:text-gray-300">{challenge.first_solver_username}</span></span>
          </div>
        }
        trailing={(
          <span className="rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-black text-green-600 dark:text-green-400 border border-green-500/20 shadow-sm">
            +{challenge.points}
          </span>
        )}
      />
    </motion.div>
  )
}
