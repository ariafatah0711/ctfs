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
          className="px-3 py-1 rounded bg-yellow-200 text-yellow-900 font-semibold text-xs hover:bg-yellow-300 transition"
          onClick={(event) => {
            event.stopPropagation()
            setShowHintModal({ challenge, hintIdx: idx })
          }}
        >
          <span className="inline-flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5" /> Hint {(challenge.hint?.length ?? 0) > 1 ? idx + 1 : ''}
          </span>
        </button>
      ))}
    </div>
  )
}
