import { EventProvider } from '@/features/events/contexts/EventContext'
import { FilterProvider } from '@/features/challenges/contexts/FilterContext'
import { SubChallengesProvider } from '@/features/challenges/contexts/SubChallengesContext'

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <EventProvider>
        <SubChallengesProvider>{children}</SubChallengesProvider>
      </EventProvider>
    </FilterProvider>
  )
}
