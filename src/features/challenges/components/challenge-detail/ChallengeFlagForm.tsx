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
    <>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          handleFlagSubmit(challenge.id)
        }}
      >
        <div className="relative flex-1 rounded border border-[#35355e] dark:border-gray-700 bg-[#181829] dark:bg-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-pink-400">
          {challenge.flag_placeholder && placeholders[challenge.id] && (
            <div
              ref={overlayRef}
              className="absolute inset-0 pl-3 pr-6 py-2 pointer-events-none text-gray-500 dark:text-gray-600 opacity-70 font-mono font-medium overflow-hidden whitespace-pre flex items-center"
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
            placeholder={challenge.flag_placeholder && placeholders[challenge.id] ? '' : 'Flag'}
            className="w-full h-full pl-3 pr-6 py-2 bg-transparent text-white focus:outline-none relative z-10 font-mono font-medium"
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
          className="px-5 py-2 rounded bg-gradient-to-br from-pink-500 to-pink-400 text-white font-bold shadow hover:from-pink-400 hover:to-pink-500 transition disabled:opacity-50"
        >
          {submitting[challenge.id] ? '...' : 'Submit'}
        </button>
      </form>

      {flagFeedback[challenge.id] && (
        <div
          className={`mt-2 p-2 rounded text-sm font-semibold
            ${flagFeedback[challenge.id]?.success
              ? 'bg-green-600 text-white dark:bg-green-700 dark:text-white'
              : 'bg-red-600 text-white dark:bg-red-700 dark:text-white'}
          `}
        >
          {flagFeedback[challenge.id]?.message}
        </div>
      )}
    </>
  )
}
