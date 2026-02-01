'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import TitlePage from '@/components/custom/TitlePage'
import Loader from '@/components/custom/loading'
import BackButton from '@/components/custom/BackButton'
import TeamPageContent from '@/components/teams/TeamPageContent'
import { useAuth } from '@/contexts/AuthContext'
import { getTeamByName, getTeamChallengesByName, TeamMember, TeamInfo, TeamSummary, TeamChallenge } from '@/lib/teams'

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user || !teamName) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      const [teamRes, challengesRes] = await Promise.all([
        getTeamByName(teamName),
        getTeamChallengesByName(teamName),
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
  }, [user, teamName])

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
        <BackButton label="Go Back" className="mb-2" />
        {/* <TitlePage icon={<Users size={30} className="text-blue-500 dark:text-blue-300" />}>
          {team?.name || teamName || 'Team'}
        </TitlePage> */}

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
