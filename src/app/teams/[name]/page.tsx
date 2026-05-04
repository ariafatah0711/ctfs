'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users } from 'lucide-react'

// Shared Imports
import APP from '@/config'
import { Loader, TitlePage } from '@/shared/components'
import { BackButton, EventSelect } from '@/shared/components/custom'
import { getTeamByName, getTeamChallengesByName, TeamMember, TeamInfo, TeamSummary, TeamChallenge } from '@/shared/lib'
import { useAuth, useEventContext } from '@/shared/contexts'

// Local Imports
import TeamPageContent from '@/app/teams/_components/TeamPageContent'

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
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  const [solvedEventIds, setSolvedEventIds] = useState<string[]>([])
  const [hasMainSolved, setHasMainSolved] = useState<boolean>(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const solvedEventSet = useMemo(
    () => new Set((solvedEventIds || []).map((id) => String(id))),
    [solvedEventIds]
  )
  const teamEvents = useMemo(
    () => startedEvents.filter((ev) => solvedEventSet.has(String(ev.id))),
    [startedEvents, solvedEventSet]
  )
  const showMainOption = hasMainSolved && !APP.hideEventMain
  const effectiveSelectedEvent = useMemo(() => {
    const allowed = new Set<string>(['all'])
    if (showMainOption) allowed.add('main')
    for (const ev of teamEvents) allowed.add(String(ev.id))

    return allowed.has(String(selectedEvent))
      ? selectedEvent
      : 'all'
  }, [selectedEvent, showMainOption, teamEvents])

  useEffect(() => {
    if (!user || !teamName) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const p_event_id = effectiveSelectedEvent === 'all' ? null : effectiveSelectedEvent === 'main' ? null : effectiveSelectedEvent
      const p_event_mode = effectiveSelectedEvent === 'all' ? 'any' : effectiveSelectedEvent === 'main' ? 'main' : 'event'

      const [teamRes, challengesRes] = await Promise.all([
        getTeamByName(teamName, p_event_id, p_event_mode),
        getTeamChallengesByName(teamName, p_event_id, p_event_mode),
      ])

      if (teamRes.error) {
        setError(teamRes.error)
        setTeam(null)
        setMembers([])
        setSummary(null)
        setSolvedEventIds([])
        setHasMainSolved(false)
      } else {
        setTeam(teamRes.team ?? null)
        setMembers(teamRes.members ?? [])
        setSummary(teamRes.stats ?? null)
        setSolvedEventIds(teamRes.solved_event_ids ?? [])
        setHasMainSolved(!!teamRes.has_main_solved)
      }

      setChallenges(challengesRes.challenges ?? [])
      setLoading(false)
    }
    fetchData()
  }, [user, teamName, effectiveSelectedEvent])

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

        {/* Loader kecil (optional, bukan full replace) */}
        {loading && !team && (
          <div className="flex justify-center py-16">
            <Loader color="text-orange-500" />
          </div>
        )}

        {/* CONTENT TETAP RENDER */}
        <>
          {team && (
            <div className="mb-4 flex justify-between items-center">
              <BackButton label="Go Back" className="mb-2" />
              <EventSelect
                value={effectiveSelectedEvent}
                onChange={setSelectedEvent}
                events={teamEvents as any}
                showMain={showMainOption}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
              />
            </div>
          )}

          {error ? (
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
        </>
      </div>
    </div>
  )
}
