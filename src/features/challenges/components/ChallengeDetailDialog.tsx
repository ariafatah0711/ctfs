'use client'

import React from 'react'
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

  const solverCount = solvers.length > 0 ? solvers.length : (challenge.total_solves ?? 0)
  const tabs: Array<{ key: ChallengeDialogTab; label: string }> = [
    { key: 'challenge', label: 'Challenge' },
    ...(showQuestionTab ? [{ key: 'question' as ChallengeDialogTab, label: 'Questions' }] : []),
    { key: 'solvers', label: `${solverCount} ${solverCount === 1 ? 'solve' : 'solves'}` },
  ]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className={DIALOG_CONTENT_CLASS + ' min-w-0 overflow-x-hidden rounded-md bg-[#232344] dark:bg-gray-900 border border-[#35355e] dark:border-gray-700 p-4 md:p-6 font-mono max-h-[90vh] overflow-y-auto scroll-hidden [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white'}
        onClick={(event) => event.stopPropagation()}
        style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
      >
        <DialogTitle asChild>
          <h2
            className={`text-xl font-bold tracking-wide max-w-max truncate block ${challenge.is_solved ? 'text-green-400 dark:text-green-300' : 'text-pink-400 dark:text-pink-300'}`}
            style={{ fontSize: '1.25rem' }}
          >
            {challenge.title}
          </h2>
        </DialogTitle>

        <ChallengeDialogTabs
          challengeId={challenge.id}
          tabs={tabs}
          activeTab={challengeTab}
          onTabChange={setChallengeTab}
        />

        {challengeTab === 'challenge' && (
          <>
            <DialogDescription asChild>
              <div className="sr-only">{challenge.description}</div>
            </DialogDescription>

            <ChallengeMetadata challenge={challenge} events={events} />

            <div className="max-w-full overflow-x-auto break-words">
              <MarkdownRenderer
                content={challenge.description}
                className="max-w-full break-words [&_p:last-child]:mb-0 [&_ul:last-child]:mb-0 [&_ol:last-child]:mb-0 [&_blockquote:last-child]:my-0"
              />
            </div>

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

            <ChallengeFlagForm
              challenge={challenge}
              flagInputs={flagInputs}
              placeholders={placeholders}
              submitting={submitting}
              flagFeedback={flagFeedback}
              handleFlagInputChange={handleFlagInputChange}
              handleFlagSubmit={handleFlagSubmit}
            />
          </>
        )}

        {challengeTab === 'solvers' && (
          <SolversList solvers={solvers} />
        )}

        {challengeTab === 'question' && (
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
