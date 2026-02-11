'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import TitlePage from '@/components/custom/TitlePage'
import Loader from '@/components/custom/loading'
import BackButton from '@/components/custom/BackButton'
import TeamPageContent from '@/components/teams/TeamPageContent'
import EventSelect from '@/components/custom/EventSelect'
import { useAuth } from '@/contexts/AuthContext'
import { getTeamByName, getTeamChallengesByName, TeamMember, TeamInfo, TeamSummary, TeamChallenge } from '@/lib/teams'
import { getEvents, filterStartedEvents } from '@/lib/events'
import { Event } from '@/types'

export default function TeamDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams<{ name: string }>()
  const teamName = decodeURIComponent(params?.name ?? '')

  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [summary, setSummary] = useState<TeamSummary | null>(null)
  const [challenges, setChallenges] = useState<TeamChallenge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (events.length > 0) return
    ;(async () => {
      try {
        const ev = await getEvents()
        setEvents(filterStartedEvents(ev || []))
      } catch {
        setEvents([])
      }
    })()
  }, [events.length])

  useEffect(() => {
    if (!user || !teamName) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const p_event_id = selectedEvent === 'all' ? null : selectedEvent === 'main' ? null : selectedEvent
      const p_event_mode = selectedEvent === 'all' ? 'any' : selectedEvent === 'main' ? 'main' : 'event'

      const [teamRes, challengesRes] = await Promise.all([
        getTeamByName(teamName, p_event_id, p_event_mode),
        getTeamChallengesByName(teamName, p_event_id, p_event_mode),
      ])

      if (teamRes.error) {
        setError(teamRes.error)
        setTeam(null)
        setMembers([])
        setSummary(null)
      } else {
        setTeam(teamRes.team ?? null)
        setMembers(teamRes.members ?? [])
        setSummary(teamRes.stats ?? null)
      }

      setChallenges(challengesRes.challenges ?? [])
      setLoading(false)
    }
    fetchData()
  }, [user, teamName, selectedEvent])

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* <TitlePage icon={<Users size={30} className="text-blue-500 dark:text-blue-300" />}>
          {team?.name || teamName || 'Team'}
        </TitlePage> */}

        {team && (
          <div className="mb-4 flex justify-between items-center">
            <BackButton label="Go Back" className="mb-2" />
            <EventSelect
              value={selectedEvent}
              onChange={setSelectedEvent}
              events={events}
              className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
              getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader fullscreen color="text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
        ) : !team ? (
          <div className="text-sm text-gray-500 dark:text-gray-300">Team not found.</div>
        ) : (
          <TeamPageContent
            team={team}
            members={members}
            summary={summary}
            challenges={challenges}
            currentUserId={user?.id}
          />
        )}
      </div>
    </div>
  )
}
