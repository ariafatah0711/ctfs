'use client'

import type { EnrichedChallengeEvent } from '../../types'
import EventCard from './EventCard'
import MainEventCard from './MainEventCard'

type MainEventOption = {
  label: string
  imageUrl: string | null
  selected: boolean
  onSelect: () => void
}

type EventsListProps = {
  title: string
  events: EnrichedChallengeEvent[]
  selectedEventId?: string | null | 'all'
  fallbackImageUrl: string | null
  now: Date
  onEventSelect: (eventId: string | null | 'all') => void
  mainEvent?: MainEventOption
  tone?: 'default' | 'ended'
  titleClassName?: string
}

export default function EventsList({
  title,
  events,
  selectedEventId,
  fallbackImageUrl,
  now,
  onEventSelect,
  mainEvent,
  tone = 'default',
  titleClassName = 'mb-3',
}: EventsListProps) {
  const delayOffset = mainEvent ? 1 : 0

  return (
    <div>
      <h3 className={`text-sm font-semibold text-gray-700 dark:text-gray-300 ${titleClassName}`}>{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mainEvent && (
          <MainEventCard
            label={mainEvent.label}
            imageUrl={mainEvent.imageUrl}
            selected={mainEvent.selected}
            delay={0}
            onSelect={mainEvent.onSelect}
          />
        )}
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            selected={selectedEventId === event.id}
            fallbackImageUrl={fallbackImageUrl}
            now={now}
            delay={(index + delayOffset) * 0.05}
            tone={tone}
            onSelect={() => onEventSelect(event.id)}
          />
        ))}
      </div>
    </div>
  )
}
