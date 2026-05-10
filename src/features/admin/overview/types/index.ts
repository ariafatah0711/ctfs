import type { DailyStats, SiteInfo as SharedSiteInfo } from '@/shared/lib'

export type TimeRange = '7d' | '30d' | '90d'

export type ActivityPoint = DailyStats
export type SiteInfo = SharedSiteInfo

export type ActionType = 'login' | 'logout' | 'user_signedup' | 'user_deleted' | 'token_refreshed'
