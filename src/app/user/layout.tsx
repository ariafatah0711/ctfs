import { EventProvider } from '@/features/events/contexts/EventContext'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventProvider>{children}</EventProvider>
}
