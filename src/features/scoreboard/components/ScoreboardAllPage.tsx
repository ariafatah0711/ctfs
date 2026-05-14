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
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {
              // Back to top 100 (selection is persisted globally; no URL param)
            }
            <BackButton href={'/scoreboard'} label="Back to Top 100" />
            <div className="w-full sm:w-auto">
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={startedEvents}
                className="w-full max-w-full sm:w-[180px]"
              />
            </div>
          </div>
          <span className="text-gray-500 text-sm">
            Showing {leaderboard.length} users
          </span>
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
