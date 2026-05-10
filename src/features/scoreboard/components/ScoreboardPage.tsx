'use client'

import { Coins, Droplet, User, Rocket } from 'lucide-react'
import { Loader, EmptyState } from '@/shared/components'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { EventSelect } from '@/shared/components/custom'
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

  if (authLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* <TitlePage icon={<Trophy size={30} className="text-yellow-500 dark:text-yellow-300 drop-shadow" />}>Scoreboard</TitlePage> */}

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

          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFirstBloodMode(false)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${!firstBloodMode
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Points"
              >
                <Coins size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  Points
                </span>
              </span>
            </button>
            <button
              onClick={() => setFirstBloodMode(true)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${firstBloodMode
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Points"
              >
                <Droplet size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  First Blood
                </span>
              </span>
            </button>
          </span>
        </div>

        {loading && leaderboard.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader color="text-orange-500" />
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
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      icon={<User className="w-full h-full" />}
                      title="No challenges solved yet."
                      description={
                        <>
                          Leaderboard is empty!<br />
                          Be the first to solve a challenge <Rocket size={16} className="inline-block ml-1 text-orange-500" />
                        </>
                      }
                      containerHeight="py-12"
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
      </div>
    </div>
  )
}
