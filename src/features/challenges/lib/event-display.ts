import type { Event } from '@/shared/types'
import { formatEventDurationCompact } from '@/shared/lib'
import type { EnrichedChallengeEvent } from '../types'

export const getEventStatus = (event: Event) => {
  const now = new Date()
  const start = event.start_time ? new Date(event.start_time) : null
  const end = event.end_time ? new Date(event.end_time) : null

  if (start && now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: 'ðŸ“…' }
  if (end && now > end) return { label: 'Ended', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: 'âœ“' }
  if (end) return { label: 'Ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: 'ðŸ”¥' }
  return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: 'ðŸ”¥' }
}

export const getTimeRemaining = (event: Event) => {
  const now = new Date()
  const start = event.start_time ? new Date(event.start_time) : null
  const end = event.end_time ? new Date(event.end_time) : null

  if (start && now < start) {
    const diff = start.getTime() - now.getTime()
    return `Starts in ${formatEventDurationCompact(diff)}`
  }
  if (end && now < end) {
    const diff = end.getTime() - now.getTime()
    return `Ends in ${formatEventDurationCompact(diff)}`
  }
  if (end && now >= end) {
    return 'Event ended'
  }
  return 'Ongoing'
}

export function normalizeEventImageUrl(url?: string | null) {
  if (!url) return null
  const trimmed = String(url).trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

export function formatEventDateTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getEventDateLabels(event: Event, now: Date) {
  const startText = formatEventDateTime(event.start_time)
  const endText = formatEventDateTime(event.end_time)
  const startLabel = startText ? ((event.start_time && new Date(event.start_time) > now) ? 'Starts' : 'Started') : null
  const endLabel = endText ? ((event.end_time && new Date(event.end_time) > now) ? 'Ends' : 'Ended') : null

  return {
    startText,
    endText,
    startLabel,
    endLabel,
  }
}

export function getEventSections(events: EnrichedChallengeEvent[], now: Date) {
  const activeList = events.filter((event) => {
    const start = event.start_time ? new Date(event.start_time) : null
    return !event.end_time && (!start || start <= now)
  })
  const ongoingList = events.filter((event) => {
    const start = event.start_time ? new Date(event.start_time) : null
    const end = event.end_time ? new Date(event.end_time) : null
    return end && end > now && (!start || start <= now)
  }).sort((a, b) => {
    const aEnd = a.end_time ? new Date(a.end_time) : null
    const bEnd = b.end_time ? new Date(b.end_time) : null
    return (aEnd?.getTime() ?? Infinity) - (bEnd?.getTime() ?? Infinity)
  })
  const upcomingList = events.filter((event) => {
    const start = event.start_time ? new Date(event.start_time) : null
    return start && start > now
  }).sort((a, b) => {
    const aStart = a.start_time ? new Date(a.start_time) : null
    const bStart = b.start_time ? new Date(b.start_time) : null
    return (aStart?.getTime() ?? Infinity) - (bStart?.getTime() ?? Infinity)
  }).sort((a, b) => {
    if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1
    return 0
  })
  const availableEvents = [...activeList, ...ongoingList].sort((a, b) => {
    if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1
    return 0
  })
  const endedEvents = events.filter((event) => {
    const end = event.end_time ? new Date(event.end_time) : null
    return end && end <= now
  }).sort((a, b) => {
    const aEnd = a.end_time ? new Date(a.end_time) : null
    const bEnd = b.end_time ? new Date(b.end_time) : null
    return (bEnd?.getTime() ?? 0) - (aEnd?.getTime() ?? 0)
  }).sort((a, b) => {
    if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1
    return 0
  })

  return {
    availableEvents,
    upcomingList,
    endedEvents,
  }
}
