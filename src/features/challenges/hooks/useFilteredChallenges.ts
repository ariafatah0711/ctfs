'use client'

import { useMemo } from 'react'
import APP from '@/config'
import type { ChallengeWithSolve } from '@/shared/types'
import {
  buildChallengeFilterOptions,
  filterChallengesByState,
  getDifficultyOrder,
  sortAndGroupChallenges,
} from '../lib'
import type {
  ChallengeEventFilterItem,
  ChallengeFilterSettings,
  ChallengeFilterState,
  ChallengeSortMode,
  EventSelectorValue,
} from '../types'

type UseFilteredChallengesOptions = {
  challenges: ChallengeWithSolve[]
  events: ChallengeEventFilterItem[]
  eventId: EventSelectorValue
  filters: ChallengeFilterState
  filterSettings: ChallengeFilterSettings
  sortMode: ChallengeSortMode
}

export function useFilteredChallenges({
  challenges,
  events,
  eventId,
  filters,
  filterSettings,
  sortMode,
}: UseFilteredChallengesOptions) {
  const difficultyOrder = useMemo(() => getDifficultyOrder((APP as any).difficultyStyles), [])
  const preferredOrder = useMemo(() => APP.challengeCategories || [], [])

  const filteredChallenges = useMemo(() => {
    return filterChallengesByState({
      challenges,
      events,
      eventId,
      filters,
      settings: filterSettings,
    })
  }, [challenges, eventId, events, filterSettings, filters])

  const { categories, difficulties } = useMemo(() => {
    return buildChallengeFilterOptions(challenges, preferredOrder)
  }, [challenges, preferredOrder])

  const { sortedFilteredChallenges, grouped, orderedKeys } = useMemo(() => {
    return sortAndGroupChallenges({
      challenges: filteredChallenges,
      sortMode,
      difficultyOrder,
      preferredCategoryOrder: preferredOrder,
    })
  }, [difficultyOrder, filteredChallenges, preferredOrder, sortMode])

  return {
    filteredChallenges,
    categories,
    difficulties,
    sortedFilteredChallenges,
    grouped,
    orderedKeys,
  }
}
