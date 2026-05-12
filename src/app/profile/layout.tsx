import { EventProvider } from '@/features/events/contexts/EventContext'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventProvider>{children}</EventProvider>
}
