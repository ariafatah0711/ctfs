'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Crown } from 'lucide-react'
import TitlePage from '@/components/custom/TitlePage'
import Loader from '@/components/custom/loading'
import BackButton from '@/components/custom/BackButton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return String(value)
    return dt.toLocaleString()
  }

  const currentMember = useMemo(() => members.find(m => m.user_id === user?.id), [members, user])

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
        <TitlePage icon={<Users size={30} className="text-blue-500 dark:text-blue-300" />}>
          {team?.name || teamName || 'Team'}
        </TitlePage>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader fullscreen color="text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
        ) : !team ? (
          <div className="text-sm text-gray-500 dark:text-gray-300">Team not found.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Team Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-300">Name</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</div>
                  {/* Invite code intentionally hidden on public team page */}
                  {currentMember && (
                    <div className="text-xs text-gray-500 dark:text-gray-300">You are {currentMember.role}.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Team Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{summary?.total_score ?? 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Score</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{summary?.unique_challenges ?? 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Challenges</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{summary?.total_solves ?? 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Solves</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-300">No members found.</div>
                ) : (
                  members.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 py-2">
                      {m.role === 'captain' ? <Crown size={16} className="text-yellow-500" /> : <Users size={16} className="text-gray-400" />}
                      <Link
                        href={`/user/${encodeURIComponent(m.username)}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                      >
                        {m.username}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                        {m.role}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Team Solves</CardTitle>
              </CardHeader>
              <CardContent>
                {challenges.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-300">No solves yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Challenge</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead>First Solve</TableHead>
                        <TableHead>First Solver</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {challenges.map((c) => (
                        <TableRow key={c.challenge_id}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">{c.title}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{c.category}</TableCell>
                          <TableCell className="text-center">{c.points}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(c.first_solved_at)}</TableCell>
                          <TableCell className="text-gray-900 dark:text-white">{c.first_solver_username}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
