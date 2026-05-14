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
  SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS,
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

  if (authLoading) return <Loader fullscreen />
  if (!user) return null

  return (
    <PageBackground
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
      contentClassName={`${PAGE_MAIN_CONTAINER_6XL} space-y-5`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          {/* Event selector */}
          <div className="w-full sm:w-auto">
            <EventSelect
              value={selectedEvent}
              onChange={setSelectedEvent}
              events={startedEvents}
              className="w-full max-w-full sm:w-[180px]"
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
          className="w-full sm:w-fit"
          stretch
        />
      </div>

      {loading && leaderboard.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader color="text-blue-500" />
        </div>
      ) : !user ? null : (
        <div className={`space-y-6 ${hasMounted ? '' : 'opacity-0'} transition-opacity duration-500`}>
          {stableLeaderboard.length > 0 && !isEmpty && (
            <div>
              <ScoreboardChart leaderboard={stableLeaderboard.length > 0 ? stableLeaderboard : leaderboard} isDark={isDark} />
            </div>
          )}
          <div>
            {isEmpty ? (
              <Card className={SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}>
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
                    containerHeight="py-12"
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
