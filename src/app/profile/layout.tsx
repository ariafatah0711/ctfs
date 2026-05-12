import { EventProvider } from '@/shared/contexts/EventContext'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventProvider>{children}</EventProvider>
}
