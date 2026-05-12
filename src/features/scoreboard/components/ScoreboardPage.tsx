'use client'

import Link from 'next/link'
import { Coins, Droplet, Trophy, Rocket } from 'lucide-react'
import Loader from '@/shared/components/Loader'
import EmptyState from '@/shared/components/EmptyState'
import { Card, CardContent } from '@/shared/ui/card'
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

  if (authLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-orange-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

          <div className="flex p-1.5 gap-1 bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 backdrop-blur-sm rounded-xl">
            <button
              onClick={() => setFirstBloodMode(false)}
              className={`px-5 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${!firstBloodMode
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
            >
              <Coins size={14} className={!firstBloodMode ? 'animate-pulse' : ''} />
              Points
            </button>
            <button
              onClick={() => setFirstBloodMode(true)}
              className={`px-5 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${firstBloodMode
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
            >
              <Droplet size={14} className={firstBloodMode ? 'animate-pulse' : ''} />
              First Blood
            </button>
          </div>
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
                <Card className="bg-white/60 dark:bg-[#111622]/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(249,115,22,0.05)] transition-all duration-300">
                  <CardContent>
                    <EmptyState
                      icon={<Trophy className="w-full h-full text-orange-500" />}
                      title="No challenges solved yet."
                      description={
                        <>
                          No submissions yet for this event. Start solving challenges and claim the top spot.
                          <Rocket size={14} className="inline-block ml-1 text-orange-400/70" />
                        </>
                      }
                      containerHeight="py-16"
                      action={
                        <Link
                          href="/challenges"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
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
      </div>
    </div>
  )
}
