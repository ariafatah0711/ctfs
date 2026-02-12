'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPreviewData, PreviewData } from '@/lib/preview'
import { Calendar, Clock, Users, CheckCircle2, Trophy, Zap } from 'lucide-react'
import ScoreboardTable from '@/components/scoreboard/ScoreboardTable'
import { LeaderboardEntry, Event } from '@/types'
import { formatEventDurationCompact, formatRelativeDate } from '@/lib/utils'
import APP from '@/config'
import Link from 'next/link'

function normalizeImageUrl(url?: string | null) {
  if (!url) return null
  const trimmed = String(url).trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

function formatEventDateTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getEventStatus = (evt: Event) => {
  const now = new Date()
  const start = evt.start_time ? new Date(evt.start_time) : null
  const end = evt.end_time ? new Date(evt.end_time) : null

  if (start && now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '📅' }
  if (end && now > end) return { label: 'Ended', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: '✓' }
  if (end) return { label: 'Ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🔥' }
  return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🔥' }
}

const getTimeRemaining = (evt: Event) => {
  const now = new Date()
  const start = evt.start_time ? new Date(evt.start_time) : null
  const end = evt.end_time ? new Date(evt.end_time) : null

  if (start && now < start) {
    const diff = start.getTime() - now.getTime()
    return `Starts in ${formatEventDurationCompact(diff)}`
  }
  if (end && now < end) {
    const diff = end.getTime() - now.getTime()
    return `Ends in ${formatEventDurationCompact(diff)}`
  }
  if (end && now >= end) {
    return 'Event ended'
  }
  return 'Ongoing'
}

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState<'scoreboard' | 'events' | 'solves'>('scoreboard')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await getPreviewData({ leaderboardLimit: 25, eventsLimit: 10, eventId: 'all' })
      if (!mounted) return
      setData(res)
      setLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const leaderboard: LeaderboardEntry[] = (data?.leaderboard || [])
    .slice()
    .sort((a, b) => (a.rank ?? 999999) - (b.rank ?? 999999))
    .slice(0, 25)
    .map((row, idx) => ({
      id: String(idx + 1),
      username: row.username,
      score: row.score ?? 0,
      rank: row.rank ?? idx + 1,
      progress: [],
    }))

  const solves = (data?.solves || []).slice(0, 25)

  const mainLabel = String(APP.eventMainLabel || 'Main')
  const mainImageUrl = normalizeImageUrl((APP as any).eventMainImageUrl)
  const mainEvent: Event = {
    id: '__main__',
    name: mainLabel,
    description: 'Default challenges dari platform ini.',
    start_time: null,
    end_time: null,
    image_url: mainImageUrl,
    created_at: null as any,
  } as any

  const events: Event[] = (!APP.hideEventMain ? [mainEvent, ...((data?.events || []) as any)] : ((data?.events || []) as any))
  const now = new Date()

  const activeList = events.filter(evt => {
    const start = evt.start_time ? new Date(evt.start_time) : null
    return !evt.end_time && (!start || start <= now)
  })

  const ongoingList = events
    .filter(evt => {
      const start = evt.start_time ? new Date(evt.start_time) : null
      const end = evt.end_time ? new Date(evt.end_time) : null
      return end && end > now && (!start || start <= now)
    })
    .sort((a, b) => {
      const aEnd = a.end_time ? new Date(a.end_time) : null
      const bEnd = b.end_time ? new Date(b.end_time) : null
      return (aEnd?.getTime() ?? Infinity) - (bEnd?.getTime() ?? Infinity)
    })

  const upcomingList = events
    .filter(evt => {
      const start = evt.start_time ? new Date(evt.start_time) : null
      return start && start > now
    })
    .sort((a, b) => {
      const aStart = a.start_time ? new Date(a.start_time) : null
      const bStart = b.start_time ? new Date(b.start_time) : null
      return (aStart?.getTime() ?? Infinity) - (bStart?.getTime() ?? Infinity)
    })

  const availableEvents = [...activeList, ...ongoingList]

  const endedEvents = events
    .filter(evt => {
      const end = evt.end_time ? new Date(evt.end_time) : null
      return end && end <= now
    })
    .sort((a, b) => {
      const aEnd = a.end_time ? new Date(a.end_time) : null
      const bEnd = b.end_time ? new Date(b.end_time) : null
      return (bEnd?.getTime() ?? 0) - (aEnd?.getTime() ?? 0)
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top: stats */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" /> Platform Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-200 to-indigo-400 dark:from-indigo-900 dark:to-indigo-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-indigo-300/60 dark:ring-indigo-800/60">
                <Users className="h-5 w-5 text-indigo-800 dark:text-indigo-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {loading ? '…' : String(data?.total_users ?? 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-green-300/60 dark:ring-green-800/60">
                <CheckCircle2 className="h-5 w-5 text-green-800 dark:text-green-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {loading ? '…' : String(data?.total_solves ?? 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Solves</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: scoreboard / events */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentTab('scoreboard')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              currentTab === 'scoreboard'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy size={16} />
              Scoreboard
            </div>
          </button>
          <button
            onClick={() => setCurrentTab('events')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              currentTab === 'events'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} />
              Events
            </div>
          </button>
          <button
            onClick={() => setCurrentTab('solves')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              currentTab === 'solves'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Solves
            </div>
          </button>
        </div>

        {currentTab === 'scoreboard' && (
          <>
            {/* Middle: leaderboard */}
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
              </div>
            ) : leaderboard.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-300">No leaderboard data yet.</div>
                </CardContent>
              </Card>
            ) : (
              <ScoreboardTable leaderboard={leaderboard} showAllLink={false} />
            )}
          </>
        )}

        {currentTab === 'events' && (
          <div className="space-y-6">
            {/* Bottom: events */}
            {loading ? null : availableEvents.length === 0 && upcomingList.length === 0 && endedEvents.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-300">No events scheduled yet.</div>
                </CardContent>
              </Card>
            ) : (
              <>
                {availableEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Available Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableEvents.map((evt) => {
                        const status = getEventStatus(evt)
                        const timeRemaining = getTimeRemaining(evt)
                        const startText = formatEventDateTime(evt.start_time)
                        const endText = formatEventDateTime(evt.end_time)
                        const startLabel = startText ? ((evt.start_time && new Date(evt.start_time) > now) ? 'Starts' : 'Started') : null
                        const endLabel = endText ? ((evt.end_time && new Date(evt.end_time) > now) ? 'Ends' : 'Ended') : null
                        return (
                          <Card
                            key={evt.id}
                            className="h-full flex flex-col overflow-hidden transition-all duration-200 bg-white dark:bg-gray-800 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-400"
                          >
                            {evt.image_url && (
                              <div className="h-72 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img src={evt.image_url} alt={evt.name} className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex-1 p-4 flex flex-col">
                              <div className="mb-3">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate" title={evt.name}>
                                  {evt.name}
                                </h4>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                  {status.icon} {status.label}
                                </div>
                              </div>

                              {evt.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                                  {evt.description}
                                </p>
                              )}

                              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                                {startText && startLabel && (
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{startLabel}: {startText}</span>
                                  </div>
                                )}
                                {endText && endLabel && (
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{endLabel}: {endText}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock size={14} />
                                  <span>{timeRemaining}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {upcomingList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingList.map((evt) => {
                        const status = getEventStatus(evt)
                        const timeRemaining = getTimeRemaining(evt)
                        const startText = formatEventDateTime(evt.start_time)
                        const endText = formatEventDateTime(evt.end_time)
                        const startLabel = startText ? ((evt.start_time && new Date(evt.start_time) > now) ? 'Starts' : 'Started') : null
                        const endLabel = endText ? ((evt.end_time && new Date(evt.end_time) > now) ? 'Ends' : 'Ended') : null
                        return (
                          <Card
                            key={evt.id}
                            className="h-full flex flex-col overflow-hidden transition-all duration-200 bg-white dark:bg-gray-800 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-400"
                          >
                            {evt.image_url && (
                              <div className="h-72 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img src={evt.image_url} alt={evt.name} className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex-1 p-4 flex flex-col">
                              <div className="mb-3">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate" title={evt.name}>
                                  {evt.name}
                                </h4>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                  {status.icon} {status.label}
                                </div>
                              </div>

                              {evt.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                                  {evt.description}
                                </p>
                              )}

                              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                                {startText && startLabel && (
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{startLabel}: {startText}</span>
                                  </div>
                                )}
                                {endText && endLabel && (
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{endLabel}: {endText}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock size={14} />
                                  <span>{timeRemaining}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {endedEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-8">Ended Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {endedEvents.map((evt) => {
                        const status = getEventStatus(evt)
                        const timeRemaining = getTimeRemaining(evt)
                        const startText = formatEventDateTime(evt.start_time)
                        const endText = formatEventDateTime(evt.end_time)
                        const startLabel = startText ? ((evt.start_time && new Date(evt.start_time) > now) ? 'Starts' : 'Started') : null
                        const endLabel = endText ? ((evt.end_time && new Date(evt.end_time) > now) ? 'Ends' : 'Ended') : null
                        return (
                          <Card
                            key={evt.id}
                            className="h-full flex flex-col overflow-hidden transition-all duration-200 bg-white dark:bg-gray-800 hover:shadow-xl hover:border-gray-400 dark:hover:border-gray-400"
                          >
                            {evt.image_url && (
                              <div className="h-72 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img src={evt.image_url} alt={evt.name} className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex-1 p-4 flex flex-col">
                              <div className="mb-3">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate" title={evt.name}>
                                  {evt.name}
                                </h4>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                  {status.icon} {status.label}
                                </div>
                              </div>

                              {evt.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                                  {evt.description}
                                </p>
                              )}

                              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                                {startText && startLabel && (
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{startLabel}: {startText}</span>
                                  </div>
                                )}
                                {endText && endLabel && (
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{endLabel}: {endText}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock size={14} />
                                  <span>{timeRemaining}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentTab === 'solves' && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Recent Solves
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
              ) : solves.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">No solves yet.</div>
              ) : (
                <ul className="space-y-2">
                  {solves.map((s: any, idx) => (
                    <li
                      key={`${s.username}-${s.solved_at}-${idx}`}
                      className="border rounded-lg px-4 py-3 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 min-w-0"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 mr-2 shrink-0">
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>

                      <div className="flex-1 flex flex-wrap items-center gap-x-2 min-w-0">
                        <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate min-w-0">
                          <Link
                            href={s.username ? `/user/${encodeURIComponent(s.username)}` : '#'}
                            className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                          >
                            <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                              {s.username}
                            </span>
                          </Link>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">solved</span>
                        <b
                          className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-flex"
                          title={s.challenge_title}
                        >
                          {s.challenge_title}
                        </b>
                        {s.challenge_category && (
                          <span className="text-gray-500 dark:text-gray-400">[{String(s.challenge_category)}]</span>
                        )}
                      </div>

                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap sm:ml-2 w-full sm:w-auto text-left sm:text-right">
                        {s.solved_at ? formatRelativeDate(s.solved_at) : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
