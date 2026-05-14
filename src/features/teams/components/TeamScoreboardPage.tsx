'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coins, Sparkles, Trophy, Rocket } from 'lucide-react'

import { APP } from '@/config'
import Loader from '@/shared/components/Loader'
import EmptyState from '@/shared/components/EmptyState'
import PageBackground from '@/shared/components/PageBackground'
import { SegmentedTabs } from '@/shared/components'
import EventSelect from '@/features/events/components/EventSelect'
import { Card, CardContent } from '@/shared/ui'
import {
  PAGE_MAIN_CONTAINER_6XL,
  SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS,
  THEME_PRIMARY_SELECTION_CLASS,
} from '@/shared/styles'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { useEventContext } from '@/features/events/contexts/EventContext'

import TeamScoreboardChart from './TeamScoreboardChart'
import TeamScoreboardTable from './TeamScoreboardTable'
import { useTeamScoreboard } from '../hooks/useTeamScoreboard'

export default function TeamScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  const [showTotalScore, setShowTotalScore] = useState(false)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const { loading, entries, series, currentTeamName } = useTeamScoreboard(user, showTotalScore, selectedEvent)

  if (authLoading) {
    return <Loader fullscreen color="text-blue-500" />
  }

  if (!user) return null

  const isDark = theme === 'dark'
  const scoreLabel = showTotalScore ? 'Total Score' : 'Unique Score'

  return (
    <PageBackground
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
      contentClassName={`${PAGE_MAIN_CONTAINER_6XL} space-y-5`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* Event Filter */}
        <div className="w-full sm:w-auto">
          <EventSelect
            value={String(selectedEvent)}
            onChange={setSelectedEvent as any}
            events={startedEvents}
            className="w-full max-w-full sm:w-[180px]"
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
          variant="panel"
          className="w-full sm:w-fit"
          stretch
        />
      </div>

      <div
        key={`${showTotalScore}-${selectedEvent}`}
        className="space-y-6"
      >
        {series.length > 0 && !showTotalScore && (
          <TeamScoreboardChart
            series={series}
            isDark={isDark}
            scoreLabel={scoreLabel}
          />
        )}

        {loading && entries.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader color="text-blue-500" />
          </div>
        ) : entries.length === 0 ? (
          <Card className={SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}>
            <CardContent>
              <EmptyState
                icon={<Trophy className="w-full h-full text-blue-500" />}
                title="No teams on the board yet."
                description={
                  <>
                    No team submissions yet for this event. Start solving challenges with your team!
                    <Rocket size={14} className="inline-block ml-1 text-blue-400/70" />
                  </>
                }
                containerHeight="py-12"
              />
            </CardContent>
          </Card>
        ) : (
          <TeamScoreboardTable
            entries={entries}
            showTotalScore={showTotalScore}
            currentTeamName={currentTeamName}
          />
        )}
      </div>
    </PageBackground>
  )
}
