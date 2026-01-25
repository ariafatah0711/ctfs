"use client";
import { Suspense, useState } from "react";
import LogsList from "./LogsList";
import TitlePage from "@/components/custom/TitlePage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/custom/loading";
import { useLogs } from '@/contexts/LogsContext'
import { Logs } from "lucide-react";
import { getEvents } from '@/lib/events'
import APP from '@/config'

export default function LogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { markAllRead, refresh, unreadCount: challengeUnread } = useLogs()
  const [tabType, setTabType] = useState<'challenges' | 'solves'>('solves')
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    // when this page loads, refresh unread count only
    if (!authLoading && user) {
      refresh()
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    (async () => {
      if (events.length === 0) {
        try {
          const ev = await getEvents()
          setEvents(ev || [])
        } catch (err) {
          setEvents([])
        }
      }
    })()
  }, [events.length])

  // Mark challenge logs as read when user selects the Challenges tab
  useEffect(() => {
    if (tabType === 'challenges' && user) {
      const eventParam = selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent
      markAllRead(eventParam as any)
    }
  }, [tabType, user, selectedEvent, markAllRead])

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      {/* <TitlePage size="text-2xl" className="mb-6"><Logs className="inline-block mr-2" /> Logs</TitlePage> */}

      {/* Event selector + Tabs: Challenge Logs / Solve Logs (styled similar to scoreboard) */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded mr-3"
          >
            {!APP.hideEventMain && <option value="main">Main</option>}
            <option value="all">All Events</option>
            {events.map((ev: any) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTabType('challenges')}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                tabType === 'challenges'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span>Challenge Logs</span>
                {challengeUnread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold bg-red-600 text-white">
                    {challengeUnread > 99 ? '99+' : String(challengeUnread)}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setTabType('solves')}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                tabType === 'solves'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Solve Logs
            </button>
          </span>
        </div>
      </div>

      <Suspense fallback={<Loader fullscreen color="text-orange-500" />}>
        {/* Map selectedEvent -> param accepted by LogsList/getChallenges
            'main' -> null, 'all' -> 'all', otherwise event id string */}
        {(() => {
          const eventParam = selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent
          return <LogsList tabType={tabType} eventId={eventParam as any} />
        })()}
      </Suspense>
    </main>
  );
}
