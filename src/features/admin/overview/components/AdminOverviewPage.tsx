"use client"

import { Loader } from '@/shared/components'
import { Card, CardContent } from '@/shared/ui'
import AuditLogList from './AuditLogList'
import OverviewStatsCards from './OverviewStatsCards'
import StatsGraph from './StatsGraph'
import { useAdminOverviewData } from '../hooks/useAdminOverviewData'
import { AdminPageShell } from '../../ui'

export default function AdminOverviewPage() {
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
    <AdminPageShell>
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

        <AuditLogList />
      </div>
    </AdminPageShell>
  )
}
