'use client'

import { Event } from '@/types'
import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import APP from '@/config'

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
  const mainLabel = String(APP.eventMainLabel || 'Main')
  // Split events into ongoing/upcoming and ended
  const now = new Date();
  // Sort events: Active first, then Ongoing (soonest end), then Upcoming (soonest start)
  const activeList = events.filter(evt => {
    // Active: no end_time, already started
    const start = evt.start_time ? new Date(evt.start_time) : null;
    return !evt.end_time && (!start || start <= now);
  });
  const ongoingList = events.filter(evt => {
    // Ongoing: started, has end_time in future
    const start = evt.start_time ? new Date(evt.start_time) : null;
    const end = evt.end_time ? new Date(evt.end_time) : null;
    return end && end > now && (!start || start <= now);
  }).sort((a, b) => {
    // Sort ongoing by soonest end time
    const aEnd = a.end_time ? new Date(a.end_time) : null;
    const bEnd = b.end_time ? new Date(b.end_time) : null;
    return (aEnd?.getTime() ?? Infinity) - (bEnd?.getTime() ?? Infinity);
  });
  const upcomingList = events.filter(evt => {
    // Upcoming: not started yet
    const start = evt.start_time ? new Date(evt.start_time) : null;
    return start && start > now;
  }).sort((a, b) => {
    // Sort upcoming by soonest start time
    const aStart = a.start_time ? new Date(a.start_time) : null;
    const bStart = b.start_time ? new Date(b.start_time) : null;
    return (aStart?.getTime() ?? Infinity) - (bStart?.getTime() ?? Infinity);
  });
  const ongoingEvents = [...activeList, ...ongoingList, ...upcomingList];
  const endedEvents = events.filter(evt => {
    const end = evt.end_time ? new Date(evt.end_time) : null;
    return end && end <= now;
  }).sort((a, b) => {
    const aEnd = a.end_time ? new Date(a.end_time) : null;
    const bEnd = b.end_time ? new Date(b.end_time) : null;
    // Most recently ended first
    return (bEnd?.getTime() ?? 0) - (aEnd?.getTime() ?? 0);
  });

  return (
    <div className="space-y-6">
      {/* Main/No Event Button */}
      {!APP.hideEventMain && (
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
              <div className="font-bold text-emerald-700 dark:text-emerald-300">{mainLabel}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Default challenges Dari Platform ini.</div>
            </div>
          </motion.button>
        </div>
      )}

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
          <div className="text-sm text-gray-600 dark:text-gray-400">Show all challenges from all events (Exclude - Intro Category that are not {mainLabel}, and Challenge have Event Ended)</div>
        </div>
      </motion.button>

      {/* Available Events List */}
      {ongoingEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Available Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ongoingEvents.map((evt, idx) => {
              const status = getEventStatus(evt);
              const timeRemaining = getTimeRemaining(evt);
              const isSelected = selectedEventId === evt.id;
              return (
                <motion.button
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => onEventSelect(evt.id)}
                  className="h-full text-left transition transform group bg-transparent p-0 border-none shadow-none"
                >
                  <Card
                    className={`h-full flex flex-col overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-600 dark:ring-indigo-400'
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
              );
            })}
          </div>
        </div>
      )}

      {/* Ended Events List */}
      {endedEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-8">Ended Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endedEvents.map((evt, idx) => {
              const status = getEventStatus(evt);
              const timeRemaining = getTimeRemaining(evt);
              const isSelected = selectedEventId === evt.id;
              return (
                <motion.button
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => onEventSelect(evt.id)}
                  className="h-full text-left transition transform group bg-transparent p-0 border-none shadow-none"
                >
                  <Card
                    className={`h-full flex flex-col overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-gray-900/20 border-gray-600 dark:border-gray-400 ring-2 ring-gray-600 dark:ring-gray-400'
                        : 'bg-white dark:bg-gray-800 hover:shadow-xl hover:border-gray-400 dark:hover:border-gray-400'
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
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {ongoingEvents.length === 0 && endedEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 dark:text-gray-400">No events scheduled yet</p>
        </div>
      )}
    </div>
  )
}
