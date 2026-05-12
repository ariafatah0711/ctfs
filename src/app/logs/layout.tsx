import { EventProvider } from '@/features/events/contexts/EventContext'
import { LogsProvider } from '@/features/logs/contexts/LogsContext'

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EventProvider>
      <LogsProvider>{children}</LogsProvider>
    </EventProvider>
  )
}
