'use client'

import { CalendarClock, CalendarX, CircleAlert, Search } from 'lucide-react'
import type { EventSelectorValue } from '../../types'

type ChallengeEmptyStateProps = {
  eventId: EventSelectorValue
  selectedEventObj: unknown
  selectedEventStart: Date | null
  selectedEventNotStarted: boolean
  selectedEventEnded: boolean
  nowDate: Date
  challengesCount: number
  formatRemaining: (ms: number) => string
}

export default function ChallengeEmptyState({
  eventId,
  selectedEventObj,
  selectedEventStart,
  selectedEventNotStarted,
  selectedEventEnded,
  nowDate,
  challengesCount,
  formatRemaining,
}: ChallengeEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        {typeof eventId === 'string' && selectedEventNotStarted ? (
          <CalendarClock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
        ) : typeof eventId === 'string' && selectedEventEnded ? (
          <CalendarX className="w-7 h-7 text-gray-400 dark:text-gray-500" />
        ) : typeof eventId === 'string' && eventId !== 'all' && !selectedEventObj ? (
          <CircleAlert className="w-7 h-7 text-gray-400 dark:text-gray-500" />
        ) : (
          <Search className="w-7 h-7 text-gray-400 dark:text-gray-500" />
        )}
      </div>
      {typeof eventId === 'string' && selectedEventNotStarted ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Event belum mulai
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Starts in {formatRemaining(selectedEventStart!.getTime() - nowDate.getTime())}
          </p>
        </>
      ) : typeof eventId === 'string' && selectedEventEnded ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Event telah berakhir
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Challenge untuk event ini sudah tidak tersedia.
          </p>
        </>
      ) : typeof eventId === 'string' && eventId !== 'all' && !selectedEventObj ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Event tidak ditemukan
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Silakan pilih event lain.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {challengesCount === 0 ? 'No challenges available' : 'No challenges match your filters'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {challengesCount === 0 ? 'Check back later for new challenges' : 'Try adjusting your filter criteria'}
          </p>
        </>
      )}
    </div>
  )
}
