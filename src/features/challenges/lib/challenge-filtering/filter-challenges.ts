import type { ChallengeWithSolve } from '@/shared/types'
import type {
  ChallengeEventFilterItem,
  ChallengeFeatureFilter,
  ChallengeFilterSettings,
  ChallengeFilterState,
  EventSelectorValue,
} from '../../types'
import { buildFuzzyOrderedList } from '../challenge-utils'

const DEFAULT_FILTERS = {
  status: 'all',
  category: 'all',
  difficulty: 'all',
  search: '',
  feature: 'N' as ChallengeFeatureFilter,
}

export type ChallengeFilterDirtyState = {
  isStatusDirty: boolean
  isCategoryDirty: boolean
  isDifficultyDirty: boolean
  isSearchDirty: boolean
  isFeatureDirty: boolean
  isEventDirty: boolean
  anyFilterDirty: boolean
}

export function getChallengeFeatureType(challenge: ChallengeWithSolve): ChallengeFeatureFilter | 'TS' {
  const hasQuestions = !!(challenge as any).has_questions
  const hasServices = Array.isArray((challenge as any).services) && (challenge as any).services.length > 0

  if (hasQuestions && hasServices) return 'TS'
  if (hasQuestions) return 'T'
  if (hasServices) return 'S'
  return 'N'
}

export function filterChallengesByState({
  challenges,
  events,
  eventId,
  filters,
  settings,
  nowMs = Date.now(),
}: {
  challenges: ChallengeWithSolve[]
  events: ChallengeEventFilterItem[]
  eventId: EventSelectorValue
  filters: ChallengeFilterState
  settings: ChallengeFilterSettings
  nowMs?: number
}): ChallengeWithSolve[] {
  return challenges.filter((challenge) => {
    if (eventId === 'all') {
      if (challenge.event_id) {
        const event = events.find((candidate) => candidate.id === challenge.event_id)
        if (!event) return false

        const start = event.start_time ? new Date(event.start_time).getTime() : null
        const end = event.end_time ? new Date(event.end_time).getTime() : null
        if (start && !Number.isNaN(start) && nowMs < start) return false
        if (end && !Number.isNaN(end) && nowMs > end) return false
      }

      const isIntro = String(challenge.category || '').toLowerCase() === 'intro'
      const isMain = challenge.event_id === null || typeof challenge.event_id === 'undefined'
      if (isIntro && !isMain) return false
    }

    if (eventId !== 'all') {
      const matchMain = eventId === null && (challenge.event_id === null || typeof challenge.event_id === 'undefined')
      const matchEvent = typeof eventId === 'string' && challenge.event_id === eventId
      if (!matchMain && !matchEvent) return false
    }

    if (settings.hideMaintenance && challenge.is_maintenance) return false

    const featureType = getChallengeFeatureType(challenge)
    if (filters.feature === 'T' && !(featureType === 'T' || featureType === 'TS')) return false
    if (filters.feature === 'S' && !(featureType === 'S' || featureType === 'TS')) return false
    if (filters.status === 'solved' && !challenge.is_solved) return false
    if (filters.status === 'unsolved' && challenge.is_solved) return false
    if (filters.category !== 'all' && challenge.category !== filters.category) return false
    if (filters.difficulty !== 'all' && challenge.difficulty !== filters.difficulty) return false

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const titleMatch = challenge.title.toLowerCase().includes(searchLower)
      const description = typeof challenge.description === 'string' ? challenge.description : ''
      const descriptionMatch = description.toLowerCase().includes(searchLower)
      if (!titleMatch && !descriptionMatch) return false
    }

    return true
  })
}

export function buildChallengeFilterOptions(challenges: ChallengeWithSolve[], preferredCategoryOrder: string[]) {
  const allCategories = Array.from(new Set(challenges.map((challenge) => challenge.category))).filter(Boolean) as string[]

  return {
    categories: buildFuzzyOrderedList(preferredCategoryOrder, allCategories),
    difficulties: Array.from(new Set(challenges.map((challenge) => challenge.difficulty))).sort(),
  }
}

export function getSortedFilterValues({
  categories,
  difficulties,
  categoryOrder,
  difficultyOrder,
}: {
  categories: string[]
  difficulties: string[]
  categoryOrder: string[]
  difficultyOrder: string[]
}) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  const normalizedDifficulties = Array.from(new Set(difficulties.map(capitalize)))

  return {
    sortedCategories: [
      ...categoryOrder.filter((category) => categories.includes(category)),
      ...categories.filter((category) => !categoryOrder.includes(category)),
    ],
    sortedDifficulties: [
      ...difficultyOrder.filter((difficulty) => normalizedDifficulties.includes(difficulty)),
      ...normalizedDifficulties.filter((difficulty) => !difficultyOrder.includes(difficulty)),
    ],
  }
}

export function getChallengeFilterDirtyState(
  filters: ChallengeFilterState,
  selectedEventId?: EventSelectorValue
): ChallengeFilterDirtyState {
  const isStatusDirty = (filters.status || 'all') !== DEFAULT_FILTERS.status
  const isCategoryDirty = (filters.category || 'all') !== DEFAULT_FILTERS.category
  const isDifficultyDirty = (filters.difficulty || 'all') !== DEFAULT_FILTERS.difficulty
  const isSearchDirty = String(filters.search || '').trim() !== DEFAULT_FILTERS.search
  const isFeatureDirty = (filters.feature || 'all') !== DEFAULT_FILTERS.feature
  const isEventDirty = selectedEventId !== 'all' && selectedEventId !== undefined && selectedEventId !== null
  const anyFilterDirty = isStatusDirty || isCategoryDirty || isDifficultyDirty || isSearchDirty || isFeatureDirty

  return {
    isStatusDirty,
    isCategoryDirty,
    isDifficultyDirty,
    isSearchDirty,
    isFeatureDirty,
    isEventDirty,
    anyFilterDirty,
  }
}

export function getNextFeatureFilterMode(featureMode: ChallengeFeatureFilter): ChallengeFeatureFilter {
  if (featureMode === 'N') return 'T'
  if (featureMode === 'T') return 'S'
  return 'N'
}

export function getFeatureFilterTitle(featureMode: ChallengeFeatureFilter): string {
  if (featureMode === 'N') return 'Feature filter: N. Click to switch to T'
  if (featureMode === 'T') return 'Feature filter: T. Click to switch to S'
  return 'Feature filter: S. Click to switch to N'
}
