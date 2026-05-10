'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Coins, Sparkles, Users } from 'lucide-react'

import { APP } from '@/config'
import { Loader } from '@/shared/components'
import { EventSelect } from '@/shared/components/custom'
import { Card, CardHeader, CardTitle, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import { useAuth, useTheme, useEventContext } from '@/shared/contexts'

import TeamScoreboardChart from './TeamScoreboardChart'
import { useTeamScoreboard } from '../hooks/useTeamScoreboard'

export default function TeamScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  const [showTotalScore, setShowTotalScore] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const { loading, entries, series } = useTeamScoreboard(user, showTotalScore, selectedEvent)

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) return null

  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            <div className="inline-block">
              <EventSelect
                value={String(selectedEvent)}
                onChange={setSelectedEvent as any}
                events={startedEvents}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
              />
            </div>
          </div>

          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowTotalScore(false)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${!showTotalScore
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Unique Score"
              >
                <Sparkles size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  Unique Score
                </span>
              </span>
            </button>
            {!APP.teams.hidescoreboardTotal && (
              <button
                onClick={() => setShowTotalScore(true)}
                className={`px-4 py-2 text-sm font-medium transition border-b-2 ${showTotalScore
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <span
                  className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                  title="Total Score"
                >
                  <Coins size={16} className="shrink-0" />
                  <span className="truncate whitespace-nowrap block">
                    Total Score
                  </span>
                </span>
              </button>
            )}
          </span>
        </div>

        <div className={`space-y-6 ${hasMounted ? '' : 'opacity-0'} transition-opacity duration-500`}>
          {series.length > 0 && !showTotalScore && (
            <TeamScoreboardChart
              series={series}
              isDark={isDark}
              scoreLabel={showTotalScore ? 'Total Score' : 'Unique Score'}
            />
          )}

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={18} /> Teams Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && entries.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader color="text-orange-500" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-300">No teams yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">{showTotalScore ? 'Total Score' : 'Unique Score'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, idx) => (
                      <TableRow key={entry.team_id}>
                        <TableCell className="text-center font-mono">{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/teams/${encodeURIComponent(entry.team_name)}`} className="hover:underline text-gray-900 dark:text-white">
                            {entry.team_name}
                          </Link>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                            <Users size={14} />
                            {entry.member_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                          {showTotalScore ? entry.total_score : entry.unique_score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
