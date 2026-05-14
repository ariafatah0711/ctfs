'use client'

import { Lightbulb } from 'lucide-react'
import type { ChallengeWithSolve } from '@/shared/types'
import type { HintModalState } from '../../types'

type ChallengeHintsProps = {
  challenge: ChallengeWithSolve
  setShowHintModal: (modal: HintModalState) => void
}

export default function ChallengeHints({
  challenge,
  setShowHintModal,
}: ChallengeHintsProps) {
  if (!Array.isArray(challenge.hint) || challenge.hint.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {(challenge.hint ?? []).map((hint: string, idx: number) => (
        <button
          key={idx}
          type="button"
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[13px] hover:bg-amber-500/20 transition flex items-center gap-2 shadow-sm"
          onClick={(event) => {
            event.stopPropagation()
            setShowHintModal({ challenge, hintIdx: idx })
          }}
        >
          <Lightbulb className="h-4 w-4" /> 
          <span>Hint {(challenge.hint?.length ?? 0) > 1 ? idx + 1 : ''}</span>
        </button>
      ))}
    </div>
  )
}
