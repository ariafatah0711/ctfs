'use client'

import { Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/shared/ui'
import {
  getEventDateLabels,
  getEventStatus,
  getTimeRemaining,
  normalizeEventImageUrl,
} from '../../lib'
import type { EnrichedChallengeEvent } from '../../types'
import EventJoinSection from './EventJoinSection'

type EventCardTone = 'default' | 'ended'

type EventCardProps = {
  event: EnrichedChallengeEvent
  selected: boolean
  fallbackImageUrl: string | null
  now: Date
  delay: number
  tone?: EventCardTone
  onSelect: () => void
}

export default function EventCard({
  event,
  selected,
  fallbackImageUrl,
  now,
  delay,
  tone = 'default',
  onSelect,
}: EventCardProps) {
  const status = getEventStatus(event)
  const timeRemaining = getTimeRemaining(event)
  const eventImageUrl = normalizeEventImageUrl(event.image_url) || fallbackImageUrl
  const { startText, endText, startLabel, endLabel } = getEventDateLabels(event, now)
  const selectedClasses = tone === 'ended'
    ? 'bg-gray-100 dark:bg-gray-900/20 border-gray-600 dark:border-gray-400 ring-2 ring-gray-600 dark:ring-gray-400'
    : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-600 dark:ring-indigo-400'
  const idleClasses = tone === 'ended'
    ? 'bg-white dark:bg-gray-800 hover:shadow-xl hover:border-gray-400 dark:hover:border-gray-400'
    : 'bg-white dark:bg-gray-800 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-400'

  return (
    <motion.button
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onSelect}
      className="h-full text-left transition transform group bg-transparent p-0 border-none shadow-none"
    >
      <Card
        className={`h-full flex flex-col overflow-hidden transition-all duration-200 ${selected ? selectedClasses : idleClasses} group-hover:scale-[1.025] group-hover:-translate-y-1 group-hover:shadow-2xl`}
      >
        {eventImageUrl ? (
          <div className="h-72 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={eventImageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-72 w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
            No image
          </div>
        )}

        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                {event.name}
              </h4>
              <EventJoinSection isLocked={event.isLocked} />
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
              {status.icon} {status.label}
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
              {event.description}
            </p>
          )}

          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
            {startText && startLabel && (
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{startLabel}: {startText}</span>
              </div>
            )}
            {endText && endLabel && (
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{endLabel}: {endText}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.button>
  )
}
