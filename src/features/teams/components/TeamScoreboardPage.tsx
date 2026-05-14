'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Coins, Sparkles, Users, Trophy, Rocket, LayoutDashboard } from 'lucide-react'

import { APP } from '@/config'
import Loader from '@/shared/components/Loader'
import EmptyState from '@/shared/components/EmptyState'
import PageBackground from '@/shared/components/PageBackground'
import { SegmentedTabs } from '@/shared/components'
import EventSelect from '@/features/events/components/EventSelect'
import { Card, CardHeader, CardTitle, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import {
  PAGE_MAIN_CONTAINER_6XL,
  SURFACE_GLASS_BASE_CLASS,
  SURFACE_GLASS_FIELD_CLASS,
} from '@/shared/styles'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { useEventContext } from '@/features/events/contexts/EventContext'
import { motion } from 'framer-motion'

import TeamScoreboardChart from './TeamScoreboardChart'
import { useTeamScoreboard } from '../hooks/useTeamScoreboard'

export default function TeamScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  const [showTotalScore, setShowTotalScore] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const { loading, entries, series } = useTeamScoreboard(user, showTotalScore, selectedEvent)

  if (authLoading) {
    return <Loader fullscreen color="text-blue-500" />
  }

  if (!user) return null

  const isDark = theme === 'dark'

  return (
    <PageBackground
      selectionClassName="selection:bg-orange-500/30"
      contentClassName={`${PAGE_MAIN_CONTAINER_6XL} space-y-6`}
    >
        {/* Modern Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Event Filter */}
          <div className="flex items-center gap-3">
            <EventSelect
              value={String(selectedEvent)}
              onChange={setSelectedEvent as any}
              events={startedEvents}
              className={`min-w-[200px] ${SURFACE_GLASS_FIELD_CLASS}`}
              getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
            />
          </div>

          {/* Mode Tabs */}
          <SegmentedTabs
            items={[
              { value: 'unique', label: 'Unique Score', icon: Sparkles },
              ...(!APP.teams.hidescoreboardTotal
                ? [{ value: 'total' as const, label: 'Total Score', icon: Coins }]
                : []),
            ]}
            value={showTotalScore ? 'total' : 'unique'}
            onChange={(tab) => setShowTotalScore(tab === 'total')}
            variant="panelLarge"
          />
        </div>

        <motion.div
          key={`${showTotalScore}-${selectedEvent}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {series.length > 0 && !showTotalScore && (
            <TeamScoreboardChart
              series={series}
              isDark={isDark}
              scoreLabel={showTotalScore ? 'Total Score' : 'Unique Score'}
            />
          )}

          <Card className={`${SURFACE_GLASS_BASE_CLASS} rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}>
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20 px-8 py-6">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard size={20} className="text-blue-500" />
                Team Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading && entries.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader color="text-blue-500" />
                </div>
              ) : entries.length === 0 ? (
                <div className="py-20 px-8">
                  <EmptyState
                    icon={<Trophy className="w-full h-full text-blue-500" />}
                    title="No teams on the board yet."
                    description={
                      <>
                        No team submissions yet for this event. Start solving challenges with your team!
                        <Rocket size={14} className="inline-block ml-1 text-blue-400/70" />
                      </>
                    }
                    containerHeight="py-0"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                        <TableHead className="w-24 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Rank</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">Team Name</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-gray-400 px-8">{showTotalScore ? 'Total Score' : 'Unique Score'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, idx) => (
                        <TableRow key={entry.team_id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                          <TableCell className="text-center font-black text-lg py-5">
                            <span className={idx < 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}>
                              {idx + 1}
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex flex-col gap-1">
                              <Link href={`/teams/${encodeURIComponent(entry.team_name)}`} className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                                {entry.team_name}
                              </Link>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                  <Users size={10} />
                                  {entry.member_count} Members
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-5 px-8">
                            <div className="inline-flex flex-col items-end">
                              <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                {showTotalScore ? entry.total_score : entry.unique_score}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Points</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
    </PageBackground>
  )
}
