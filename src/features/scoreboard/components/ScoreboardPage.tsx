'use client'

import Link from 'next/link'
import { Coins, Droplet, Trophy, Rocket } from 'lucide-react'
import Loader from '@/shared/components/Loader'
import EmptyState from '@/shared/components/EmptyState'
import PageBackground from '@/shared/components/PageBackground'
import { SegmentedTabs } from '@/shared/components'
import { Card, CardContent } from '@/shared/ui/card'
import {
  PAGE_MAIN_CONTAINER_6XL,
  THEME_PRIMARY_BG_CLASS,
  THEME_PRIMARY_BG_HOVER_CLASS,
  THEME_PRIMARY_SELECTION_CLASS,
} from '@/shared/styles'
import EventSelect from '@/features/events/components/EventSelect'
import { useScoreboardPageData } from '../hooks'
import ScoreboardChart from './ScoreboardChart'
import ScoreboardTable from './ScoreboardTable'

export default function ScoreboardPage() {
  const {
    user,
    authLoading,
    leaderboard,
    loading,
    firstBloodMode,
    setFirstBloodMode,
    startedEvents,
    selectedEvent,
    setSelectedEvent,
    hasMounted,
    stableLeaderboard,
    isEmpty,
    isDark,
    eventParam,
  } = useScoreboardPageData()

  if (authLoading) return <Loader fullscreen color="text-blue-500" />
  if (!user) return null

  return (
    <PageBackground
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
      contentClassName={`${PAGE_MAIN_CONTAINER_6XL} space-y-8`}
    >
        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            {/* Event selector */}
            <div className="inline-block">
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={startedEvents}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(event: any) => String(event?.name ?? event?.title ?? 'Untitled')}
              />
            </div>
          </div>

          <SegmentedTabs
            items={[
              { value: 'points', label: 'Points', icon: Coins },
              { value: 'first-blood', label: 'First Blood', icon: Droplet },
            ]}
            value={firstBloodMode ? 'first-blood' : 'points'}
            onChange={(tab) => setFirstBloodMode(tab === 'first-blood')}
            variant="panel"
          />
        </div>

        {loading && leaderboard.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader color="text-blue-500" />
          </div>
        ) : !user ? null : (
          <div className={`space-y-8 ${hasMounted ? '' : 'opacity-0'} transition-opacity duration-500`}>
            {stableLeaderboard.length > 0 && !isEmpty && (
              <div>
                <ScoreboardChart leaderboard={stableLeaderboard.length > 0 ? stableLeaderboard : leaderboard} isDark={isDark} />
              </div>
            )}
            <div>
              {isEmpty ? (
                <Card className="bg-white/60 dark:bg-[#111622]/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(249,115,22,0.05)] transition-all duration-300">
                  <CardContent>
                    <EmptyState
                      icon={<Trophy className="w-full h-full text-blue-500" />}
                      title="No challenges solved yet."
                      description={
                        <>
                          No submissions yet for this event. Start solving challenges and claim the top spot.
                          <Rocket size={14} className="inline-block ml-1 text-blue-400/70" />
                        </>
                      }
                      containerHeight="py-16"
                      action={
                        <Link
                          href="/challenges"
                          className={`inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${THEME_PRIMARY_BG_CLASS} ${THEME_PRIMARY_BG_HOVER_CLASS}`}
                        >
                          Explore Challenges
                        </Link>
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <ScoreboardTable
                  leaderboard={leaderboard}
                  currentUsername={user?.username}
                  eventId={eventParam}
                  scoreColumnLabel={firstBloodMode ? 'First Blood' : undefined}
                  scoreColumnRenderer={(entry) => entry.score}
                  showAllLink={!firstBloodMode}
                />
              )}
            </div>
          </div>
        )}
    </PageBackground>
  )
}
