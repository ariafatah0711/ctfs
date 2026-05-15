'use client'

import Loader from '@/shared/components/Loader'
import BackButton from '@/shared/components/BackButton'
import EventSelect from '@/features/events/components/EventSelect'
import { THEME_PRIMARY_TEXT_CLASS } from '@/shared/styles'
import { useScoreboardAllPageData } from '../hooks'
import ScoreboardTable from './ScoreboardTable'

export default function ScoreboardAllPage() {
  const {
    user,
    authLoading,
    leaderboard,
    loading,
    startedEvents,
    selectedEvent,
    setSelectedEvent,
  } = useScoreboardAllPageData()

  if (authLoading) return <Loader fullscreen />
  if (!user) return null

  return (
    <div className="">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Modern Header Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton
              href="/scoreboard"
              label="Back"
              className="h-10 rounded-xl border border-gray-200/50 bg-white/50 px-4 hover:bg-white dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800"
            />

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block" />

            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Global Rankings
              </h1>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                Showing {leaderboard.length} competitors
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:w-[200px]">
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={startedEvents}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {loading && leaderboard.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader color={THEME_PRIMARY_TEXT_CLASS} />
          </div>
        ) : (
          <div
            className={loading ? 'opacity-70 transition-opacity' : 'opacity-100 transition-opacity'}
          >
            <ScoreboardTable
              leaderboard={leaderboard}
              currentUsername={user?.username}
            />
          </div>
        )}
      </div>
    </div>
  )
}
