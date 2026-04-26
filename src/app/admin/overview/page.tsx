"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks'
import { Loader, customComponents } from '@/shared/components'
import { Card, CardContent } from '@/shared/ui'
import { getChallengesList, getStatsByRange, getInfo, isGlobalAdmin } from '../_lib'
import { Challenge, SiteInfo } from '../_types'
import { AuditLogList, StatsGraph } from '../_components'

export default function AdminOverviewPage() {
  const { BackButton } = customComponents
  const router = useRouter()
  const { user, loading } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [activityData, setActivityData] = useState<{ date: string; solves: number; activeUsers: number; }[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      // if not logged in, redirect to challenges listing
      if (!user) {
        router.push('/challenges')
        return
      }

      const adminCheck = await isGlobalAdmin()
      if (!mounted) return
      if (!adminCheck) {
        router.push('/challenges')
        return
      }

      const [data, info, stats] = await Promise.all([
        getChallengesList(undefined, true),
        getInfo(),
        getStatsByRange(timeRange),
      ])

      if (!mounted) return
      setChallenges(data)
      setSiteInfo(info)
      setActivityData(stats)
    })()

    return () => { mounted = false }
  }, [user, loading, router])

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/admin" label="Go Back" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold mb-1">{siteInfo?.total_users || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold mb-1">{siteInfo?.total_solves || 0}</div>
                <div className="text-sm text-muted-foreground">Total Solves</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold mb-1">{challenges.length}</div>
                <div className="text-sm text-muted-foreground">Total Challenges</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-800 pt-5">
            <CardContent>
              <StatsGraph
                data={activityData}
                range={timeRange}
                onRangeChange={async (newRange: '7d' | '30d' | '90d') => {
                  setTimeRange(newRange)
                  const stats = await getStatsByRange(newRange)
                  setActivityData(stats)
                }}
              />
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <AuditLogList />
        </div>
      </main>
    </div>
  )
}
