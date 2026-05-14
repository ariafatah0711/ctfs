'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import Loader from '@/shared/components/Loader'
import PageBackground from '@/shared/components/PageBackground'
import { PAGE_MAIN_CONTAINER_6XL } from '@/shared/styles'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useEventContext } from '@/features/events/contexts/EventContext'

import TeamPageContent from './TeamPageContent'
import { useTeamDetail } from '../hooks/useTeamDetail'
import { useTeamEvents } from '../hooks/useTeamEvents'

export default function TeamDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams<{ name: string }>()
  const teamName = decodeURIComponent(params?.name ?? '')
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const [tempSolvedEventIds, setTempSolvedEventIds] = useState<string[]>([])
  const [tempHasMainSolved, setTempHasMainSolved] = useState<boolean>(false)

  const { teamEvents, showMainOption, effectiveSelectedEvent } = useTeamEvents(
    startedEvents,
    tempSolvedEventIds,
    tempHasMainSolved,
    selectedEvent
  )

  const {
    loading,
    team,
    members,
    summary,
    challenges,
    solvedEventIds,
    hasMainSolved,
    error
  } = useTeamDetail(user, teamName, effectiveSelectedEvent)

  useEffect(() => {
    setTempSolvedEventIds(solvedEventIds)
    setTempHasMainSolved(hasMainSolved)
  }, [solvedEventIds, hasMainSolved])

  // Stable states to prevent DOM swap flicker
  const [stableTeam, setStableTeam] = useState<any>(null)
  const [stableMembers, setStableMembers] = useState<any[]>([])
  const [stableSummary, setStableSummary] = useState<any>(null)
  const [stableChallenges, setStableChallenges] = useState<any[]>([])

  useEffect(() => {
    requestAnimationFrame(() => {
      setStableTeam(team)
      setStableMembers(members)
      setStableSummary(summary)
      setStableChallenges(challenges)
    })
  }, [team, members, summary, challenges])

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) return null

  return (
    <PageBackground
      selectionClassName="selection:bg-orange-500/30"
      contentClassName={`${PAGE_MAIN_CONTAINER_6XL} space-y-6`}
    >
        {loading && !team && (
          <div className="flex justify-center py-16">
            <Loader color="text-orange-500" />
          </div>
        )}

        {loading && team && (
          <div className="fixed top-20 right-8 z-50 opacity-70 pointer-events-none">
            <Loader color="text-orange-500" />
          </div>
        )}

        <>
          {error ? (
            <div className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">{error}</div>
          ) : !team && !loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-300">Team not found.</div>
          ) : (
            <AnimatePresence mode="wait">
              {team && (
                <motion.div
                  key={effectiveSelectedEvent}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <TeamPageContent
                    team={stableTeam || team}
                    members={stableMembers.length > 0 ? stableMembers : members}
                    summary={stableSummary || summary}
                    challenges={stableChallenges.length > 0 ? stableChallenges : challenges}
                    currentUserId={user?.id}

                    effectiveSelectedEvent={effectiveSelectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    teamEvents={teamEvents as any}
                    showMainOption={showMainOption}
                    onBack={() => router.back()}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
    </PageBackground>
  )
}
