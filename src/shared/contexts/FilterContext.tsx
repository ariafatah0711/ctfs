"use client"
import React from 'react'

export type ChallengeFilters = {
  status: 'all' | 'solved' | 'unsolved'
  category: string
  difficulty: string
  search: string
  feature: 'T' | 'S' | 'N'
}

const STORAGE_KEY = 'ctfs:challengeFilters'

const defaultFilters: ChallengeFilters = {
  status: 'all',
  category: 'all',
  difficulty: 'all',
  search: '',
  feature: 'N'
}

type LayoutMode = 'grouped' | 'compact'
type SortMode = 'default' | 'newest'

type FilterContextValue = {
  filters: ChallengeFilters
  setFilters: (v: ChallengeFilters | ((prev: ChallengeFilters) => ChallengeFilters)) => void
  resetFilters: () => void
  layoutMode: LayoutMode
  setLayoutMode: (m: LayoutMode | ((prev: LayoutMode) => LayoutMode)) => void
  sortMode: SortMode
  setSortMode: (m: SortMode | ((prev: SortMode) => SortMode)) => void
}

const FilterContext = React.createContext<FilterContextValue | null>(null)

function readStored(): { filters: ChallengeFilters; layoutMode: LayoutMode; sortMode: SortMode } {
  try {
    if (typeof window === 'undefined') return { filters: defaultFilters, layoutMode: 'grouped', sortMode: 'default' }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { filters: defaultFilters, layoutMode: 'grouped', sortMode: 'default' }
    const parsed = JSON.parse(raw)
    const storedFeature = parsed?.filters?.feature ?? parsed?.feature
    const normalizedFeature = storedFeature === 'T' || storedFeature === 'S' || storedFeature === 'N' ? storedFeature : 'N'
    return {
      filters: { ...defaultFilters, ...(parsed.filters || parsed), feature: normalizedFeature },
      layoutMode: (parsed.layoutMode as LayoutMode) || 'grouped',
      sortMode: (parsed.sortMode as SortMode) || 'default'
    }
  } catch {
    return { filters: defaultFilters, layoutMode: 'grouped', sortMode: 'default' }
  }
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const stored = React.useMemo(() => readStored(), [])
  const [filters, setFiltersState] = React.useState<ChallengeFilters>(() => stored.filters)
  const [layoutMode, setLayoutModeState] = React.useState<LayoutMode>(() => stored.layoutMode)
  const [sortMode, setSortModeState] = React.useState<SortMode>(() => stored.sortMode)

  const setFilters = React.useCallback((v: any) => {
    setFiltersState((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try {
        const raw = JSON.stringify({ filters: next, layoutMode })
        localStorage.setItem(STORAGE_KEY, raw)
      } catch {}
      return next
    })
  }, [layoutMode])

  const setLayoutMode = React.useCallback((v: any) => {
    setLayoutModeState((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try {
        const raw = JSON.stringify({ filters, layoutMode: next, sortMode })
        localStorage.setItem(STORAGE_KEY, raw)
      } catch {}
      return next
    })
  }, [filters, sortMode])

  const setSortMode = React.useCallback((v: any) => {
    setSortModeState((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try {
        const raw = JSON.stringify({ filters, layoutMode, sortMode: next })
        localStorage.setItem(STORAGE_KEY, raw)
      } catch {}
      return next
    })
  }, [filters, layoutMode])

  const resetFilters = React.useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setFiltersState(defaultFilters)
  }, [])

  const value: FilterContextValue = React.useMemo(() => ({ filters, setFilters, resetFilters, layoutMode, setLayoutMode, sortMode, setSortMode }), [filters, setFilters, resetFilters, layoutMode, setLayoutMode, sortMode, setSortMode])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilterContext() {
  const ctx = React.useContext(FilterContext)
  if (!ctx) throw new Error('useFilterContext must be used within <FilterProvider>')
  return ctx
}

export default FilterProvider
