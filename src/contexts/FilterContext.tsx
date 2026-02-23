"use client"
import React from 'react'

export type ChallengeFilters = {
  status: 'all' | 'solved' | 'unsolved'
  category: string
  difficulty: string
  search: string
}

const STORAGE_KEY = 'ctfs:challengeFilters'

const defaultFilters: ChallengeFilters = {
  status: 'all',
  category: 'all',
  difficulty: 'all',
  search: ''
}

type LayoutMode = 'grouped' | 'compact'

type FilterContextValue = {
  filters: ChallengeFilters
  setFilters: (v: ChallengeFilters | ((prev: ChallengeFilters) => ChallengeFilters)) => void
  resetFilters: () => void
  layoutMode: LayoutMode
  setLayoutMode: (m: LayoutMode | ((prev: LayoutMode) => LayoutMode)) => void
}

const FilterContext = React.createContext<FilterContextValue | null>(null)

function readStored(): { filters: ChallengeFilters; layoutMode: LayoutMode } {
  try {
    if (typeof window === 'undefined') return { filters: defaultFilters, layoutMode: 'grouped' }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { filters: defaultFilters, layoutMode: 'grouped' }
    const parsed = JSON.parse(raw)
    return {
      filters: { ...defaultFilters, ...(parsed.filters || parsed) },
      layoutMode: (parsed.layoutMode as LayoutMode) || 'grouped'
    }
  } catch {
    return { filters: defaultFilters, layoutMode: 'grouped' }
  }
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const stored = React.useMemo(() => readStored(), [])
  const [filters, setFiltersState] = React.useState<ChallengeFilters>(() => stored.filters)
  const [layoutMode, setLayoutModeState] = React.useState<LayoutMode>(() => stored.layoutMode)

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
        const raw = JSON.stringify({ filters, layoutMode: next })
        localStorage.setItem(STORAGE_KEY, raw)
      } catch {}
      return next
    })
  }, [filters])

  const resetFilters = React.useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setFiltersState(defaultFilters)
  }, [])

  const value: FilterContextValue = React.useMemo(() => ({ filters, setFilters, resetFilters, layoutMode, setLayoutMode }), [filters, setFilters, resetFilters, layoutMode, setLayoutMode])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilterContext() {
  const ctx = React.useContext(FilterContext)
  if (!ctx) throw new Error('useFilterContext must be used within <FilterProvider>')
  return ctx
}

export default FilterProvider
