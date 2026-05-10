'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { MarkdownRenderer } from '@/shared/components'
import type { SubChallengeMode, SubChallengeQuestion } from '../../types'

type SubChallengePanelProps = {
  challengeId: string
  loaded: boolean
  loading: boolean
  submitting: boolean
  mode: SubChallengeMode
  questions: SubChallengeQuestion[]
  nextQuestion: SubChallengeQuestion | null
  answers: Record<string, string>
  results: Record<string, boolean>
  completed: boolean
  flag: string | null
  message: string | null
  onAnswerChange: (orderNumber: number, value: string) => void
  onSubmit: (orderNumber?: number) => void
  onReset: () => void
}

function normalizeQuestionMarkdown(value: string) {
  const trimmed = String(value ?? '').trim()
  const wrappedInQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.charCodeAt(0) === 0x201c && trimmed.charCodeAt(trimmed.length - 1) === 0x201d) ||
    (trimmed.startsWith('\u00e2\u20ac\u0153') && trimmed.endsWith('\u00e2\u20ac\u009d'))

  return wrappedInQuotes ? trimmed.slice(1, -1).trim() : trimmed
}

type QuestionCardProps = {
  question: SubChallengeQuestion
  answer: string
  result?: boolean
  submitting: boolean
  completed: boolean
  current?: boolean
  onAnswerChange: (value: string) => void
  onSubmit: () => void
}

function QuestionCard({
  question,
  answer,
  result,
  submitting,
  completed,
  current = false,
  onAnswerChange,
  onSubmit,
}: QuestionCardProps) {
  const cardClassName = completed
    ? 'min-w-0 overflow-x-hidden space-y-2 rounded-md border border-[#35355e] bg-[#1a1a33]/50 p-2.5 opacity-90'
    : current
      ? 'min-w-0 overflow-x-hidden space-y-2 rounded-md border border-pink-500/30 bg-[#1a1a33] p-2.5 shadow-lg shadow-pink-500/5'
      : 'min-w-0 overflow-x-hidden space-y-2 rounded-md p-2.5 border border-pink-500/10 bg-[#1a1a33]'

  return (
    <div className={cardClassName}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-[10px] uppercase tracking-[0.18em] ${completed ? 'text-gray-500' : 'text-pink-300/70'}`}>
              Question #{question.order_number}
            </p>
            {completed && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded border bg-green-900/50 text-green-400 border-green-800">
                Completed
              </span>
            )}
            {!completed && !current && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded border bg-pink-900/30 text-pink-200 border-pink-700/40">
                Pending
              </span>
            )}
          </div>
          <div className={`mt-1 max-w-full overflow-x-auto break-words text-sm font-semibold ${completed ? 'text-gray-200' : 'text-white'}`}>
            <MarkdownRenderer content={normalizeQuestionMarkdown(question.question)} className="max-w-full break-words" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={answer}
          onChange={completed ? undefined : (event) => onAnswerChange(event.target.value)}
          placeholder={completed ? 'Answer saved' : 'Type your answer...'}
          readOnly={completed}
          className={
            completed
              ? 'flex-1 px-3 py-2 rounded border border-[#35355e] bg-[#1a1a33] text-gray-400 focus:outline-none cursor-not-allowed text-sm'
              : current
                ? 'flex-1 px-3 py-2 rounded border border-[#35355e] dark:border-gray-700 bg-[#181829] dark:bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-400'
                : 'flex-1 px-3 py-2 rounded border text-sm focus:outline-none border-[#35355e] dark:border-gray-700 bg-[#181829] dark:bg-gray-800 text-white focus:ring-2 focus:ring-pink-400'
          }
          onKeyDown={(event) => {
            if (!completed && event.key === 'Enter') {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
        {!completed && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !answer?.trim()}
            className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {submitting ? '...' : 'Check'}
          </button>
        )}
      </div>

      {!completed && typeof result === 'boolean' && result === false && answer?.trim() && (
        <p className="text-xs font-semibold text-red-300">âœ— Incorrect</p>
      )}
    </div>
  )
}

export default function SubChallengePanel({
  challengeId,
  loaded,
  loading,
  submitting,
  mode,
  questions,
  nextQuestion,
  answers,
  results,
  completed,
  flag,
  message,
  onAnswerChange,
  onSubmit,
  onReset,
}: SubChallengePanelProps) {
  const [copiedFlag, setCopiedFlag] = useState<Record<string, boolean>>({})
  const subChallengeFlagCopyKey = `${challengeId}-sub-flag`
  const hasQuestions =
    mode === 'non_sequential'
      ? questions.length > 0
      : mode === 'sequential'
        ? !!nextQuestion || completed
        : false
  const isShowingEmptyQuestionMessage = !loading && loaded && !hasQuestions

  return (
    <div className="space-y-3 min-w-0 overflow-x-hidden">
      {loading && !hasQuestions && (
        <div className="text-sm text-gray-300">Loading questions...</div>
      )}

      {isShowingEmptyQuestionMessage && (
        <div className="text-sm text-gray-300">
          {message || 'No sub-question configured for this challenge.'}
        </div>
      )}

      {!loading && mode !== 'none' && (
        <div className="space-y-2.5">
          {mode === 'non_sequential' ? (
            questions.map((question) => {
              const orderKey = String(question.order_number)
              const isCompleted = results[orderKey] === true

              return (
                <QuestionCard
                  key={question.order_number}
                  question={question}
                  answer={answers[orderKey] || ''}
                  result={results[orderKey]}
                  submitting={submitting}
                  completed={isCompleted}
                  onAnswerChange={(value) => onAnswerChange(question.order_number, value)}
                  onSubmit={() => onSubmit(question.order_number)}
                />
              )
            })
          ) : (
            <>
              {questions.filter((question) => results[String(question.order_number)] === true).map((question) => (
                <QuestionCard
                  key={question.order_number}
                  question={question}
                  answer={answers[String(question.order_number)] || ''}
                  result={results[String(question.order_number)]}
                  submitting={submitting}
                  completed
                  onAnswerChange={() => {}}
                  onSubmit={() => {}}
                />
              ))}

              {!completed && nextQuestion && (
                <QuestionCard
                  question={nextQuestion}
                  answer={answers[String(nextQuestion.order_number)] || ''}
                  result={results[String(nextQuestion.order_number)]}
                  submitting={submitting}
                  completed={false}
                  current
                  onAnswerChange={(value) => onAnswerChange(nextQuestion.order_number, value)}
                  onSubmit={() => onSubmit(nextQuestion.order_number)}
                />
              )}
            </>
          )}
        </div>
      )}

      {hasQuestions && !completed && mode === 'non_sequential' && (
        <button
          type="button"
          disabled={submitting || !Object.values(answers).some((value) => value?.trim())}
          onClick={() => onSubmit()}
          className="px-5 py-2 rounded bg-gradient-to-br from-[#35355e] to-[#232344] text-white font-bold shadow hover:from-[#4a4a7a] transition disabled:opacity-50 border border-gray-600"
        >
          {submitting ? '...' : 'Submit All Answers'}
        </button>
      )}

      {hasQuestions && (
        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset your progress for this challenge? This will clear all your locally saved answers.')) {
                onReset()
              }
            }}
            className="text-[10px] text-gray-500 hover:text-red-400 transition underline decoration-dotted underline-offset-2"
          >
            Reset Progress
          </button>
        </div>
      )}

      {message && !isShowingEmptyQuestionMessage && (
        <div className="p-2 rounded text-sm font-semibold bg-[#2c2c52] text-gray-100">
          {message}
        </div>
      )}

      {completed && (
        <div className="p-2 rounded text-sm font-semibold bg-green-600 text-white">
          All questions correct.
        </div>
      )}

      {flag && (
        <div className="flex items-center gap-2 rounded bg-emerald-700 text-white p-2 text-sm font-semibold break-all">
          <span className="min-w-0 flex-1">Flag: {flag}</span>
          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-900/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-50 transition hover:bg-emerald-900/60"
            onClick={async () => {
              try {
                if (!navigator.clipboard) {
                  toast.error('Clipboard not available')
                  return
                }
                await navigator.clipboard.writeText(flag)
                setCopiedFlag((prev) => ({ ...prev, [subChallengeFlagCopyKey]: true }))
                setTimeout(() => setCopiedFlag((prev) => ({ ...prev, [subChallengeFlagCopyKey]: false })), 2000)
                toast.success('Flag copied to clipboard')
              } catch (error) {
                console.error('Copy failed', error)
                toast.error('Failed to copy flag')
              }
            }}
          >
            {copiedFlag[subChallengeFlagCopyKey] ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
          </button>
        </div>
      )}
    </div>
  )
}
