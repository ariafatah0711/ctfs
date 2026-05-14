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

  if (authLoading) return <Loader fullscreen color={THEME_PRIMARY_TEXT_CLASS} />
  if (!user) return null

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {
              // Back to top 100 (selection is persisted globally; no URL param)
            }
            <BackButton href={'/scoreboard'} label="Back to Top 100" />
            <div>
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={startedEvents}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
              />
            </div>
          </div>
          <span className="text-gray-500 text-sm">
            Showing {leaderboard.length} users
          </span>
        </div>

        {loading && leaderboard.length === 0 ? (
          <div className="flex justify-center py-16">
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
