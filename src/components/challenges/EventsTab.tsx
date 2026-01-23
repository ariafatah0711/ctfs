'use client'

import { Event } from '@/types'
import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import ImageWithFallback from '@/components/ImageWithFallback'

type Props = {
  events: Event[]
  selectedEventId?: string | null | 'all'
  onEventSelect: (eventId: string | null | 'all') => void
}

const getEventStatus = (evt: Event) => {
  const now = new Date()
  const start = evt.start_time ? new Date(evt.start_time) : null
  const end = evt.end_time ? new Date(evt.end_time) : null

  if (start && now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '📅' }
  if (end && now > end) return { label: 'Ended', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: '✓' }
  if (end) return { label: 'Ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🔥' }
  return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🔥' }
}

const getTimeRemaining = (evt: Event) => {
  const now = new Date()
  const start = evt.start_time ? new Date(evt.start_time) : null
  const end = evt.end_time ? new Date(evt.end_time) : null

  const formatRemaining = (ms: number) => {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  if (start && now < start) {
    const diff = start.getTime() - now.getTime()
    return `Starts in ${formatRemaining(diff)}`
  }
  if (end && now < end) {
    const diff = end.getTime() - now.getTime()
    return `Ends in ${formatRemaining(diff)}`
  }
  if (end && now >= end) {
    return 'Event ended'
  }
  return 'Ongoing'
}

export default function EventsTab({ events, selectedEventId, onEventSelect }: Props) {
  // Sort events: ongoing first, then upcoming, then ended
  const sortedEvents = [...events].sort((a, b) => {
    const now = new Date()

    const aStart = a.start_time ? new Date(a.start_time) : null
    const aEnd = a.end_time ? new Date(a.end_time) : null
    const bStart = b.start_time ? new Date(b.start_time) : null
    const bEnd = b.end_time ? new Date(b.end_time) : null

    const aStatus = getEventStatus(a)
    const bStatus = getEventStatus(b)

    const statusOrder = { 'Ongoing': 0, 'Upcoming': 1, 'Active': 0, 'Ended': 2 }
    const aStatusPriority = statusOrder[aStatus.label as keyof typeof statusOrder] ?? 999
    const bStatusPriority = statusOrder[bStatus.label as keyof typeof statusOrder] ?? 999

    if (aStatusPriority !== bStatusPriority) {
      return aStatusPriority - bStatusPriority
    }

    // If same status, sort by time
    if (aStatusPriority === 0) { // Ongoing/Active
      return (aEnd?.getTime() ?? 0) - (bEnd?.getTime() ?? 0)
    } else if (aStatusPriority === 1) { // Upcoming
      return (aStart?.getTime() ?? 0) - (bStart?.getTime() ?? 0)
    } else { // Ended
      return (bEnd?.getTime() ?? 0) - (aEnd?.getTime() ?? 0)
    }
  })

  return (
    <div className="space-y-6">
      {/* Main/No Event Button */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Featured</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onEventSelect(null)}
          className={`w-full p-4 rounded-lg border-2 transition ${
            selectedEventId === null
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-400'
          }`}
        >
          <div className="text-left">
            <div className="font-bold text-emerald-700 dark:text-emerald-300">MAIN</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Default challenges Dari Platform ini.</div>
          </div>
        </motion.button>
      </div>

      {/* All Events Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onEventSelect('all')}
        className={`w-full p-4 rounded-lg border-2 transition ${
          selectedEventId === 'all'
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400'
        }`}
      >
        <div className="text-left">
          <div className="font-bold text-blue-700 dark:text-blue-300">ALL Events</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Show all challenges from all events (Exclude - Preliminaries that are not Main)</div>
        </div>
      </motion.button>

      {/* Events List */}
      {sortedEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Available Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedEvents.map((evt, idx) => {
              const status = getEventStatus(evt)
              const timeRemaining = getTimeRemaining(evt)
              const isSelected = selectedEventId === evt.id

              return (
                <motion.button
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => onEventSelect(evt.id)}
                  className={`h-full text-left transition transform group ${
                    isSelected
                      ? 'ring-2 ring-indigo-600 dark:ring-indigo-400'
                      : ''
                  }`}
                >
                  <Card
                    className={`h-full flex flex-col overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400'
                        : 'bg-white dark:bg-gray-800 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-400'
                    } group-hover:scale-[1.025] group-hover:-translate-y-1 group-hover:shadow-2xl`}
                  >
                    {/* Image */}
                    {evt.image_url && (
                      <div className="h-72 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img
                          src={evt.image_url}
                          alt={evt.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col">
                      {/* Title & Status */}
                      <div className="mb-3">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {evt.name}
                        </h4>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.icon} {status.label}
                        </div>
                      </div>

                      {/* Description */}
                      {evt.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                          {evt.description}
                        </p>
                      )}

                      {/* Time Info */}
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                        {evt.start_time && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{new Date(evt.start_time).toLocaleDateString()}</span>
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
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 dark:text-gray-400">No events scheduled yet</p>
        </div>
      )}
    </div>
  )
}
