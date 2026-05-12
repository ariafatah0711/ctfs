import { EventProvider } from '@/shared/contexts/EventContext'

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventProvider>{children}</EventProvider>
}
