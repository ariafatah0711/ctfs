"use client"

import { Loader, customComponents } from '@/shared/components'
import { Card, CardContent } from '@/shared/ui'
import { AuditLogList, OverviewStatsCards, StatsGraph } from '../_components'
import { useAdminOverviewData } from '../_hooks'

export default function AdminOverviewPage() {
  const { BackButton } = customComponents
  const {
    user,
    authLoading,
    isLoading,
    challenges,
    siteInfo,
    timeRange,
    activityData,
    refreshStats,
  } = useAdminOverviewData()

  if (authLoading || isLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/admin" label="Go Back" />
        </div>

        <div className="space-y-6">
          <OverviewStatsCards siteInfo={siteInfo} challengeCount={challenges.length} />

          <Card className="bg-white dark:bg-gray-800 pt-5">
            <CardContent>
              <StatsGraph
                data={activityData}
                range={timeRange}
                onRangeChange={refreshStats}
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
