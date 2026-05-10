import type { ChallengeWithSolve } from '@/shared/types'

export function normalizeChallengeHints(raw: unknown): string[] {
  let hints: string[] = []

  if (Array.isArray(raw)) {
    hints = raw.filter((hint): hint is string => typeof hint === 'string')
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) hints = parsed.filter((hint): hint is string => typeof hint === 'string')
      else if (typeof parsed === 'string') hints = [parsed]
    } catch {
      if (raw.trim() !== '') hints = [raw]
    }
  } else if (raw && typeof raw !== 'object') {
    hints = [String(raw)]
  }

  return hints
}

export function getDifficultyOrder(difficultyStyles?: Record<string, unknown>): string[] {
  return Object.keys(difficultyStyles || {}).map((key) => String(key).trim().toLowerCase())
}

export function getDifficultyRank(difficulty: unknown, difficultyOrder: string[]): number {
  if (!difficulty) return difficultyOrder.length

  const normalized = String(difficulty).trim().toLowerCase()
  if (normalized === 'imposible') {
    const fixedIndex = difficultyOrder.indexOf('impossible')
    return fixedIndex === -1 ? difficultyOrder.length : fixedIndex
  }

  const index = difficultyOrder.indexOf(normalized)
  return index === -1 ? difficultyOrder.length : index
}

export function sortChallengesByDisplayPriority<T extends Pick<ChallengeWithSolve, 'points' | 'total_solves' | 'difficulty' | 'title'>>(
  list: T[],
  difficultyOrder: string[]
): T[] {
  return [...list].sort((a, b) => {
    if ((a.points ?? 0) !== (b.points ?? 0)) return (a.points ?? 0) - (b.points ?? 0)

    const solvesA = a.total_solves ?? 0
    const solvesB = b.total_solves ?? 0
    if (solvesA !== solvesB) return solvesB - solvesA

    const rankA = getDifficultyRank(a.difficulty, difficultyOrder)
    const rankB = getDifficultyRank(b.difficulty, difficultyOrder)
    if (rankA !== rankB) return rankA - rankB

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function sortChallengesByNewest<T extends Pick<ChallengeWithSolve, 'created_at' | 'title'>>(
  list: T[]
): T[] {
  return [...list].sort((a, b) => {
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0

    if (createdA !== createdB) return createdB - createdA

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function buildFuzzyOrderedList(preferredOrder: string[], values: string[]): string[] {
  const matchedValues = new Set<string>()

  return [
    ...preferredOrder.flatMap((preferred) => {
      const preferredLower = preferred.toLowerCase()
      const found = values.find((value) => {
        const valueLower = value.toLowerCase()
        return valueLower.includes(preferredLower) || preferredLower.includes(valueLower)
      })

      if (found && !matchedValues.has(found)) {
        matchedValues.add(found)
        return found
      }

      return [] as string[]
    }),
    ...values.filter((value) => !matchedValues.has(value)).sort(),
  ]
}

export function groupChallengesByCategory(challenges: ChallengeWithSolve[]): Record<string, ChallengeWithSolve[]> {
  return challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) acc[challenge.category] = []
    acc[challenge.category].push(challenge)
    return acc
  }, {} as Record<string, ChallengeWithSolve[]>)
}
