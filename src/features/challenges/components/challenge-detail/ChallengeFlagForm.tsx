'use client'

import React from 'react'
import type { ChallengeWithSolve } from '@/shared/types'
import { formatSmartFlag } from '../../lib/flag-formatting'
import type { KeyedBooleanMap, KeyedFlagFeedbackMap, KeyedStringMap } from '../../types'

type ChallengeFlagFormProps = {
  challenge: ChallengeWithSolve
  flagInputs: KeyedStringMap
  placeholders: KeyedStringMap
  submitting: KeyedBooleanMap
  flagFeedback: KeyedFlagFeedbackMap
  handleFlagInputChange: (challengeId: string, value: string) => void
  handleFlagSubmit: (challengeId: string) => void
}

export default function ChallengeFlagForm({
  challenge,
  flagInputs,
  placeholders,
  submitting,
  flagFeedback,
  handleFlagInputChange,
  handleFlagSubmit,
}: ChallengeFlagFormProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col gap-3">
      {flagFeedback[challenge.id] && (
        <div
          className={`p-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-center shadow-sm transition-all
            ${flagFeedback[challenge.id]?.success
              ? 'bg-green-500 text-white dark:bg-green-600'
              : 'bg-red-500 text-white dark:bg-red-600'}
          `}
        >
          {flagFeedback[challenge.id]?.message}
        </div>
      )}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          handleFlagSubmit(challenge.id)
        }}
      >
        <div className="relative flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-pink-400 transition-all">
          {challenge.flag_placeholder && placeholders[challenge.id] && (
            <div
              ref={overlayRef}
              className="absolute inset-0 pl-4 pr-6 py-2.5 pointer-events-none text-gray-400 dark:text-gray-600 opacity-50 font-mono text-sm overflow-hidden whitespace-pre flex items-center"
            >
              <span className="invisible">{flagInputs[challenge.id] || ''}</span>
              <span>{placeholders[challenge.id].slice((flagInputs[challenge.id] || '').length)}</span>
            </div>
          )}
          <input
            type="text"
            onScroll={(event) => {
              if (overlayRef.current) overlayRef.current.scrollLeft = event.currentTarget.scrollLeft
            }}
            value={flagInputs[challenge.id] || ''}
            onChange={(event) => {
              const value = event.target.value
              const mask = placeholders[challenge.id]
              if (challenge.flag_placeholder && mask) {
                handleFlagInputChange(challenge.id, formatSmartFlag(value, mask))
              } else {
                handleFlagInputChange(challenge.id, value)
              }
            }}
            maxLength={challenge.flag_placeholder && placeholders[challenge.id] ? placeholders[challenge.id].length : undefined}
            placeholder={challenge.flag_placeholder && placeholders[challenge.id] ? '' : 'Enter flag here...'}
            className="w-full h-full pl-4 pr-6 py-2.5 bg-transparent text-gray-900 dark:text-white focus:outline-none relative z-10 font-mono text-sm"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={
            submitting[challenge.id] ||
            !flagInputs[challenge.id]?.trim() ||
            (challenge.flag_placeholder && placeholders[challenge.id] ? (flagInputs[challenge.id] || '').length !== placeholders[challenge.id].length : false)
          }
          className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:from-pink-400 hover:to-pink-500 transition-all disabled:opacity-30 active:scale-95"
        >
          {submitting[challenge.id] ? '...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
