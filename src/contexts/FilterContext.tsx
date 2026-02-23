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

type FilterContextValue = {
  filters: ChallengeFilters
  setFilters: (v: ChallengeFilters | ((prev: ChallengeFilters) => ChallengeFilters)) => void
  resetFilters: () => void
}

const FilterContext = React.createContext<FilterContextValue | null>(null)

function readStored(): ChallengeFilters {
  try {
    if (typeof window === 'undefined') return defaultFilters
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFilters
    const parsed = JSON.parse(raw)
    return { ...defaultFilters, ...parsed }
  } catch {
    return defaultFilters
  }
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = React.useState<ChallengeFilters>(() => readStored())

  const setFilters = React.useCallback((v: any) => {
    setFiltersState((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const resetFilters = React.useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setFiltersState(defaultFilters)
  }, [])

  const value: FilterContextValue = React.useMemo(() => ({ filters, setFilters, resetFilters }), [filters, setFilters, resetFilters])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilterContext() {
  const ctx = React.useContext(FilterContext)
  if (!ctx) throw new Error('useFilterContext must be used within <FilterProvider>')
  return ctx
}

export default FilterProvider
