import { EventProvider } from '@/shared/contexts/EventContext'
import { LogsProvider } from '@/shared/contexts/LogsContext'

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
