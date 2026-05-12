import { EventProvider } from '@/features/events/contexts/EventContext'

export default function ScoreboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventProvider>{children}</EventProvider>
}
