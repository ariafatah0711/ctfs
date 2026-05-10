"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks'
import { getChallengesList, getInfo, getStatsByRange, isGlobalAdmin } from '@/shared/lib'
import type { Challenge } from '@/shared/types'
import type { ActivityPoint, TimeRange, SiteInfo } from '../types'

export function useAdminOverviewData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [activityData, setActivityData] = useState<ActivityPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshStats = useCallback(async (newRange: TimeRange) => {
    setTimeRange(newRange)
    const stats = await getStatsByRange(newRange)
    setActivityData(stats)
  }, [])

  useEffect(() => {
    let mounted = true

    const initOverviewData = async () => {
      if (authLoading) return

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

      const [challengeList, info, stats] = await Promise.all([
        getChallengesList(undefined, true),
        getInfo(),
        getStatsByRange(timeRange),
      ])

      if (!mounted) return
      setChallenges(challengeList)
      setSiteInfo(info)
      setActivityData(stats)
      setIsLoading(false)
    }

    initOverviewData()
    return () => { mounted = false }
  }, [authLoading, user, router, timeRange])

  return {
    user,
    authLoading,
    isLoading,
    challenges,
    siteInfo,
    timeRange,
    activityData,
    refreshStats,
  }
}
