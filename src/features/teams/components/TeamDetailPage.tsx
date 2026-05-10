'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import { Loader } from '@/shared/components'
import { BackButton, EventSelect } from '@/shared/components/custom'
import { useAuth, useEventContext } from '@/shared/contexts'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
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
          {team && (
            <div className="mb-4 flex justify-between items-center">
              <BackButton label="Go Back" className="mb-2" />
              <EventSelect
                value={effectiveSelectedEvent}
                onChange={setSelectedEvent}
                events={teamEvents as any}
                showMain={showMainOption}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
              />
            </div>
          )}

          {error ? (
            <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      </div>
    </div>
  )
}
