import React from 'react'
import { Card, CardContent } from '@/shared/ui'
import { SiteInfo } from '../_types'

interface OverviewStatsCardsProps {
  siteInfo: SiteInfo | null
  challengeCount: number
}

const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({ siteInfo, challengeCount }) => {
  return (
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
          <div className="text-2xl font-semibold mb-1">{challengeCount}</div>
          <div className="text-sm text-muted-foreground">Total Challenges</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OverviewStatsCards
