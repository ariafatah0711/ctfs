import type { ChallengeWithSolve } from '@/shared/types'

export type ChallengesMainTab = 'challenges' | 'events'
export type ChallengeDialogTab = 'challenge' | 'question' | 'solvers'
export type EventSelectorValue = string | null | 'all'

export type Solver = {
  username: string
  solvedAt: string
}

export type ChallengeFilterSettings = {
  hideMaintenance: boolean
  highlightTeamSolves: boolean
}

export type FlagFeedback = {
  success: boolean
  message: string
}

export type HintModalState = {
  challenge: ChallengeWithSolve | null
  hintIdx?: number
}

export type KeyedStringMap = Record<string, string>
export type KeyedBooleanMap = Record<string, boolean>
export type KeyedFlagFeedbackMap = Record<string, FlagFeedback | null>
