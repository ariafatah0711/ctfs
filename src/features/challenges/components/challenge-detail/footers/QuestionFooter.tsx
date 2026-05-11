import React from 'react'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { DialogFooterLayout } from './DialogFooterLayout'

export interface QuestionFooterProps {
  subChallengeCompleted: boolean
  subChallengeFlag: string | null
  onReset: () => void
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  subChallengeCompleted,
  subChallengeFlag,
  onReset,
}) => {
  const handleResetConfirm = () => {
    if (confirm('Are you sure you want to reset your progress?')) {
      onReset()
    }
  }

  return (
    <DialogFooterLayout className="bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex-1 flex items-center min-w-0">
          {subChallengeCompleted ? (
            subChallengeFlag ? (
              <div className="flex-1 flex items-center h-[38px] bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50 shadow-[0_2px_10px_rgba(34,197,94,0.1)] overflow-hidden">
                <div className="flex-1 px-4 font-mono text-xs sm:text-sm text-green-700 dark:text-green-300 truncate select-all font-bold tracking-wide">
                  {subChallengeFlag}
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(subChallengeFlag)
                    toast.success('Flag copied!', { icon: '📋' })
                  }}
                  className="flex items-center justify-center px-4 h-full bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 shadow-md shrink-0"
                  title="Copy Flag"
                >
                  <Copy size={16} className="sm:hidden" />
                  <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Copy</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-widest px-4 h-[38px] bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="truncate">All Questions Solved</span>
              </div>
            )
          ) : (
            <div className="flex items-center px-4 h-[38px] text-[11px] uppercase font-black text-gray-500 dark:text-gray-500 tracking-[0.2em] bg-gray-200/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="truncate">Questions Not Solved</span>
            </div>
          )}
        </div>

        <button
          onClick={handleResetConfirm}
          className="flex items-center justify-center px-4 h-[38px] text-[11px] font-bold text-red-500/80 hover:text-red-500 uppercase tracking-widest underline decoration-red-500/30 hover:decoration-red-500 underline-offset-4 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 shrink-0"
        >
          Reset
        </button>
      </div>
    </DialogFooterLayout>
  )
}
