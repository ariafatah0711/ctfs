'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import { Loader } from '@/shared/components'
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-orange-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
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
      </div>
    </div>
  )
}
