'use client'

import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import APP from '@/config'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui'
import { MarkdownRenderer } from '@/shared/components'
import { DIALOG_CONTENT_CLASS } from '@/shared/styles'
import type { Attachment, ChallengeWithSolve } from '@/shared/types'
import ChallengeServicesPanel from './ChallengeServicesPanel'
import HintDialog from './HintDialog'
import SolversList from './SolversList'
import ChallengeAttachments from './challenge-detail/ChallengeAttachments'
import ChallengeDialogTabs from './challenge-detail/ChallengeDialogTabs'
import ChallengeFlagForm from './challenge-detail/ChallengeFlagForm'
import ChallengeHints from './challenge-detail/ChallengeHints'
import ChallengeMetadata from './challenge-detail/ChallengeMetadata'
import ChallengeTasksTeaser from './challenge-detail/ChallengeTasksTeaser'
import SubChallengePanel from './challenge-detail/SubChallengePanel'
import type {
  ChallengeDialogTab,
  HintModalState,
  KeyedBooleanMap,
  KeyedFlagFeedbackMap,
  KeyedStringMap,
  Solver,
  SubChallengeMode,
  SubChallengeQuestion,
} from '../types'

interface ChallengeDetailDialogProps {
  open: boolean
  challenge: ChallengeWithSolve | null
  solvers: Solver[]
  challengeTab: ChallengeDialogTab
  showQuestionTab: boolean
  setChallengeTab: (tab: ChallengeDialogTab, challengeId?: string) => void
  onClose: () => void
  flagInputs: KeyedStringMap
  handleFlagInputChange: (challengeId: string, value: string) => void
  handleFlagSubmit: (challengeId: string) => void
  submitting: KeyedBooleanMap
  flagFeedback: KeyedFlagFeedbackMap
  downloading: KeyedBooleanMap
  downloadFile: (attachment: Attachment, attachmentKey: string) => void
  showHintModal: HintModalState
  setShowHintModal: (modal: HintModalState) => void
  events?: { id: string; name: string }[]
  subChallengeLoaded: boolean
  subChallengeLoading: boolean
  subChallengeSubmitting: boolean
  subChallengeMode: SubChallengeMode
  subChallengeQuestions: SubChallengeQuestion[]
  subChallengeNextQuestion: SubChallengeQuestion | null
  subChallengeAnswers: Record<string, string>
  subChallengeResults: Record<string, boolean>
  subChallengeCompleted: boolean
  subChallengeFlag: string | null
  subChallengeMessage: string | null
  onSubChallengeAnswerChange: (orderNumber: number, value: string) => void
  onSubChallengeSubmit: (orderNumber?: number) => void
  onSubChallengeReset: () => void
  placeholders: KeyedStringMap
  services?: string[]
}

const ChallengeDetailDialog: React.FC<ChallengeDetailDialogProps> = ({
  open,
  challenge,
  solvers,
  challengeTab,
  showQuestionTab,
  setChallengeTab,
  onClose,
  flagInputs,
  handleFlagInputChange,
  handleFlagSubmit,
  submitting,
  flagFeedback,
  downloading,
  downloadFile,
  showHintModal,
  setShowHintModal,
  onSubChallengeReset,
  events = [],
  subChallengeLoaded,
  subChallengeLoading,
  subChallengeSubmitting,
  subChallengeMode,
  subChallengeQuestions,
  subChallengeNextQuestion,
  subChallengeAnswers,
  subChallengeResults,
  subChallengeCompleted,
  subChallengeFlag,
  subChallengeMessage,
  onSubChallengeAnswerChange,
  onSubChallengeSubmit,
  placeholders,
  services = [],
}) => {
  if (!challenge) return null

  const [solvesSortOrder, setSolvesSortOrder] = useState<'newest' | 'oldest'>('oldest')

  const solverCount = solvers.length > 0 ? solvers.length : (challenge.total_solves ?? 0)

  const tabs = React.useMemo(() => [
    { key: 'challenge' as ChallengeDialogTab, label: 'Challenge' },
    ...(showQuestionTab ? [{ key: 'question' as ChallengeDialogTab, label: 'Questions' }] : []),
    { key: 'solvers' as ChallengeDialogTab, label: `${solverCount} ${solverCount === 1 ? 'solve' : 'solves'}` },
  ], [solverCount, showQuestionTab])

  // Sort solvers based on selected order
  const sortedSolvers = React.useMemo(() => {
    return [...solvers].sort((a, b) => {
      const timeA = new Date(a.solvedAt).getTime()
      const timeB = new Date(b.solvedAt).getTime()
      return solvesSortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })
  }, [solvers, solvesSortOrder])

  // Difficulty color mapping (matching ChallengeCard)
  const rawDiff = (challenge.difficulty || '').toString().trim();
  const normalizedDiff = rawDiff === 'imposible' ? 'Impossible' : rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();
  const colorName = (APP as any).difficultyStyles?.[normalizedDiff];
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };
  const diffCircleColor = colorMap[colorName] || 'bg-gray-300';
  const eventName = events.find(e => e.id === challenge.event_id)?.name || '';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="max-w-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white/60 dark:bg-[#111622]/60 border border-gray-200 dark:border-gray-800 backdrop-blur-xl p-0 shadow-2xl [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-gray-500 dark:[&_button.absolute.right-4.top-4]:text-gray-400"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Fixed Header Section */}
        <div className="p-4 md:px-6 pb-0 shrink-0">
          <div className="flex flex-col gap-3 mb-5 pointer-events-none select-none">
            {/* ROW 1: Title & Event */}
            <div className="flex items-start justify-between gap-4">
              <DialogTitle asChild>
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                  {challenge.title}
                </h2>
              </DialogTitle>
              {eventName && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2 shrink-0 font-medium">
                  {eventName}
                </span>
              )}
            </div>

            {/* ROW 2: Metadata & Points */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-4">
                {/* Category Badge */}
                <div className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/20">
                  {challenge.category}
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${diffCircleColor} shadow-sm`} />
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {normalizedDiff}
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {challenge.points}
              </div>
            </div>
          </div>

          <ChallengeDialogTabs
            challengeId={challenge.id}
            tabs={tabs}
            activeTab={challengeTab}
            onTabChange={setChallengeTab}
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 md:px-6 scroll-hidden">
          {challengeTab === 'challenge' && (
            <div className="min-h-full flex flex-col">
              {/* Description at the Top */}
              <div className="flex-1">
                <div className="max-w-full overflow-x-auto break-words mt-2">
                  <MarkdownRenderer
                    content={challenge.description}
                    className="max-w-full break-words text-gray-700 dark:text-gray-300 leading-relaxed [&_p:last-child]:mb-0 [&_ul:last-child]:mb-0 [&_ol:last-child]:mb-0 [&_blockquote:last-child]:my-0"
                  />
                </div>
              </div>

              {/* Links, Tasks, and Hints at the Bottom (before flag form) */}
              <div className="mt-8 space-y-6">
                <ChallengeServicesPanel open={open} services={services} />

                <ChallengeAttachments
                  challenge={challenge}
                  downloading={downloading}
                  downloadFile={downloadFile}
                />

                {showQuestionTab && (
                  <ChallengeTasksTeaser
                    challengeId={challenge.id}
                    onTabChange={setChallengeTab}
                  />
                )}

                <ChallengeHints
                  challenge={challenge}
                  setShowHintModal={setShowHintModal}
                />
              </div>
            </div>
          )}

          {challengeTab === 'solvers' && (
            <div className="min-h-full">
              <SolversList solvers={sortedSolvers} />
            </div>
          )}

          {challengeTab === 'question' && (
            <div className="min-h-full">
              <SubChallengePanel
                challengeId={challenge.id}
                loaded={subChallengeLoaded}
                loading={subChallengeLoading}
                submitting={subChallengeSubmitting}
                mode={subChallengeMode}
                questions={subChallengeQuestions}
                nextQuestion={subChallengeNextQuestion}
                answers={subChallengeAnswers}
                results={subChallengeResults}
                completed={subChallengeCompleted}
                flag={subChallengeFlag}
                message={subChallengeMessage}
                onAnswerChange={onSubChallengeAnswerChange}
                onSubmit={onSubChallengeSubmit}
                onReset={onSubChallengeReset}
              />
            </div>
          )}
        </div>

        {/* Fixed Footer for Flag Submission / Questions Progress */}
        {challengeTab === 'challenge' && (
          <div className="p-4 md:p-6 pt-3 border-t border-gray-100 dark:border-gray-800/50 shrink-0">
            <ChallengeFlagForm
              challenge={challenge}
              flagInputs={flagInputs}
              placeholders={placeholders}
              submitting={submitting}
              flagFeedback={flagFeedback}
              handleFlagInputChange={handleFlagInputChange}
              handleFlagSubmit={handleFlagSubmit}
            />
          </div>
        )}

        {challengeTab === 'question' && (
          <div className="p-4 md:p-6 pt-3 border-t border-gray-100 dark:border-gray-800/50 shrink-0 bg-gray-50/30 dark:bg-gray-900/30">
            {subChallengeCompleted ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All Questions Solved
                </div>
                {subChallengeFlag && (
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <div className="px-3 py-1.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-mono text-xs truncate border border-green-200 dark:border-green-800">
                      {subChallengeFlag}
                    </div>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(subChallengeFlag);
                        toast.success('Flag copied!');
                      }}
                      className="p-1.5 rounded bg-green-500 text-white hover:bg-green-600 transition"
                      title="Copy Flag"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">
                  Questions Not Solved
                </span>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset your progress?')) {
                      onSubChallengeReset();
                    }
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest underline decoration-dotted underline-offset-4"
                >
                  Reset Progress
                </button>
              </div>
            )}
          </div>
        )}
        {challengeTab === 'solvers' && (
          <div className="p-4 md:p-6 pt-3 border-t border-gray-100 dark:border-gray-800/50 shrink-0 bg-gray-50/30 dark:bg-gray-900/30">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">
                Order by solve time
              </span>
              <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setSolvesSortOrder('oldest')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all active:scale-95 ${solvesSortOrder === 'oldest'
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => setSolvesSortOrder('newest')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all active:scale-95 ${solvesSortOrder === 'newest'
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                >
                  Newest
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
      <HintDialog
        challenge={showHintModal.challenge}
        hintIdx={showHintModal.hintIdx}
        open={!!showHintModal.challenge}
        onClose={() => setShowHintModal({ challenge: null })}
      />
    </Dialog>
  )
}

export default ChallengeDetailDialog
