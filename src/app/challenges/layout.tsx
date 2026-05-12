import { EventProvider } from '@/shared/contexts/EventContext'
import { FilterProvider } from '@/shared/contexts/FilterContext'
import { SubChallengesProvider } from '@/shared/contexts/SubChallengesContext'

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
