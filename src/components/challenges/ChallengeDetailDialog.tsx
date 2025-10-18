import React, { useState } from 'react';
import CustomBadge from '@/components/ui/CustomBadge';
import DifficultyBadge from '@/components/custom/DifficultyBadge';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import SolversList, { Solver } from './SolversList';
import HintDialog from './HintDialog';
import { Attachment, ChallengeWithSolve } from '@/types';

interface ChallengeDetailDialogProps {
  open: boolean;
  challenge: ChallengeWithSolve | null;
  solvers: Solver[];
  challengeTab: 'challenge' | 'solvers';
  setChallengeTab: (tab: 'challenge' | 'solvers', challengeId?: string) => void;
  onClose: () => void;
  flagInputs: { [key: string]: string };
  handleFlagInputChange: (challengeId: string, value: string) => void;
  handleFlagSubmit: (challengeId: string) => void;
  submitting: { [key: string]: boolean };
  flagFeedback: { [key: string]: { success: boolean, message: string } | null };
  downloading: { [key: string]: boolean };
  downloadFile: (attachment: Attachment, attachmentKey: string) => void;
  showHintModal: { challenge: ChallengeWithSolve | null, hintIdx?: number };
  setShowHintModal: (modal: { challenge: ChallengeWithSolve | null, hintIdx?: number }) => void;
}

const ChallengeDetailDialog: React.FC<ChallengeDetailDialogProps> = ({
  open,
  challenge,
  solvers,
  challengeTab,
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
}) => {
  const [copiedAll, setCopiedAll] = useState<{ [key: string]: boolean }>({});
  if (!challenge) return null;

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        className="w-full max-w-lg rounded-md bg-[#232344] dark:bg-gray-900 border border-[#35355e] dark:border-gray-700 p-8 font-mono max-h-[90vh] overflow-y-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scroll-hidden [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
      >
        {/* Header: title + close (DialogTitle for accessibility) */}
        <DialogTitle asChild>
          <h2
            className={`text-xl font-bold tracking-wide ${challenge.is_solved ? 'text-green-400 dark:text-green-300' : 'text-pink-400 dark:text-pink-300'}`}
            style={{ fontSize: '1.25rem' }}
          >
            {challenge.title}
          </h2>
        </DialogTitle>

        {/* Tabs */}
         <div className="flex justify-between gap-2">
          <button
            className={`flex-1 px-2 py-1 rounded-t-md font-bold text-sm transition-colors ${challengeTab === 'challenge' ? 'bg-[#35355e] dark:bg-gray-800 text-pink-300 dark:text-pink-200' : 'bg-[#232344] dark:bg-gray-900 text-gray-300 dark:text-gray-400 hover:text-pink-200'}`}
            onClick={() => setChallengeTab('challenge', challenge.id)}
          >
            Challenge
          </button>
          <button
            className={`flex-1 px-2 py-1 rounded-t-md font-bold text-sm transition-colors ${challengeTab === 'solvers' ? 'bg-[#35355e] dark:bg-gray-800 text-pink-300 dark:text-pink-200' : 'bg-[#232344] dark:bg-gray-900 text-gray-300 dark:text-gray-400 hover:text-pink-200'}`}
            onClick={() => setChallengeTab('solvers', challenge.id)}
          >
            {solvers.length ? `${solvers.length} ${solvers.length === 1 ? 'solve' : 'solves'}` : "0 solves"}
          </button>
        </div>

        {/* Content: Challenge detail */}
        {challengeTab === 'challenge' && (
          <>
            {/* Description for accessibility (DialogDescription) */}
            <DialogDescription asChild>
              <div className="sr-only">{challenge.description}</div>
            </DialogDescription>
            {/* Badge bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CustomBadge label={challenge.category} color="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200" />
                {/* Difficulty badge */}
                <span>
                  <React.Suspense fallback={<span className="inline-block min-w-[64px] text-center text-xs font-semibold">{challenge.difficulty}</span>}>
                    <DifficultyBadge className="min-w-[62px]" difficulty={challenge.difficulty} />
                  </React.Suspense>
                </span>
              </div>
              <span className={`flex items-center gap-1 text-base font-bold ${challenge.is_solved ? 'text-green-300 dark:text-white' : 'text-yellow-300 dark:text-white'}`}>
                🪙 {challenge.points}
              </span>
            </div>

            {/* Description */}
            <div className="max-w-full overflow-x-auto break-words">
              <MarkdownRenderer content={challenge.description} className="max-w-full break-words" />
            </div>

            {/* Attachments */}
            {challenge.attachments && challenge.attachments.length > 0 && (
              <div className="mb-1 space-y-3">
                {/* File Attachments */}
                {challenge.attachments.some(att => att.type === 'file') && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">📂 Files</p>
                    <div className="flex flex-wrap gap-2">
                      {/* Copy wget commands for all files (compact icon/text) */}
                      <button
                      key="copy-wget-all"
                      type="button"
                      title="Copy wget commands for all files"
                      className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded-md shadow transition"
                      onClick={e => {
                        e.stopPropagation();
                        const fileAttachments = challenge.attachments!.filter(att => att.type === 'file' && (att.url || att.name));
                        if (!fileAttachments.length) return;
                        const commands = fileAttachments.map((att, idx) => {
                          const url = att.url || '';
                          const filename = (att.name && att.name.trim()) || url.split('/').pop() || `file-${idx}`;
                          const escUrl = url.replace(/'/g, "'\\'\'");
                          const escName = filename.replace(/'/g, "'\\'\'");
                          return `wget '${escUrl}' -O '${escName}'`;
                        });
                        const joined = commands.join(' && ');
                        if (!navigator.clipboard) {
                          toast.error('Clipboard not available')
                          return
                        }
                        navigator.clipboard.writeText(joined).then(() => {
                          const key = `${challenge.id}-copied`;
                          setCopiedAll(prev => ({ ...prev, [key]: true }));
                          setTimeout(() => setCopiedAll(prev => ({ ...prev, [key]: false })), 2000);
                          toast.success('Copied wget commands to clipboard')
                        }).catch((err) => {
                          console.error('Copy failed', err)
                          toast.error('Failed to copy to clipboard')
                        });
                      }}
                    >
                      <span className="text-xs font-mono">
                        {copiedAll[`${challenge.id}-copied`] ? 'Copied!' : 'copy wget'}
                      </span>
                    </button>

                    {/* 🧱 Pembatas visual */}
                    <span className="text-gray-500">|</span>

                      {challenge.attachments.filter(att => att.type === 'file').map((attachment, idx) => {
                        const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + "..." : attachment.name || 'file';
                        const key = `${challenge.id}-${idx}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            title={attachment.name}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-md shadow"
                            onClick={e => {
                              e.stopPropagation();
                              downloadFile(attachment, key);
                            }}
                            disabled={downloading[key]}
                          >
                            {downloading[key] ? "Downloading..." : displayName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* URL Attachments */}
                {challenge.attachments.some(att => att.type !== 'file') && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">🔗 Links</p>
                    <div className="flex flex-wrap gap-2">
                      {challenge.attachments.filter(att => att.type !== 'file').map((attachment, idx) => {
                        const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + "..." : attachment.name || (attachment.url ? attachment.url.slice(0, 40) + "..." : 'link');
                        return (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={attachment.url}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-md shadow"
                          >
                            {displayName}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hint buttons */}
            {Array.isArray(challenge.hint) && challenge.hint.length > 0 && (
              <div className="mb-1 flex flex-wrap gap-2">
                {(challenge.hint ?? []).map((hint: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    className="px-3 py-1 rounded bg-yellow-200 text-yellow-900 font-semibold text-xs hover:bg-yellow-300 transition"
                    onClick={e => {
                      e.stopPropagation();
                      setShowHintModal({ challenge, hintIdx: idx });
                    }}
                  >
                    💡 Hint {(challenge.hint?.length ?? 0) > 1 ? idx + 1 : ''}
                  </button>
                ))}
              </div>
            )}
            {/* Flag input */}
            <form
              className="flex gap-2"
              onSubmit={e => {
                e.preventDefault();
                handleFlagSubmit(challenge.id);
              }}
            >
              <input
                type="text"
                value={flagInputs[challenge.id] || ''}
                onChange={e => handleFlagInputChange(challenge.id, e.target.value)}
                placeholder="Flag"
                className="flex-1 px-3 py-2 rounded border border-[#35355e] dark:border-gray-700 bg-[#181829] dark:bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting[challenge.id] || !flagInputs[challenge.id]?.trim()}
                className="px-5 py-2 rounded bg-gradient-to-br from-pink-500 to-pink-400 text-white font-bold shadow hover:from-pink-400 hover:to-pink-500 transition disabled:opacity-50"
              >
                {submitting[challenge.id] ? '...' : 'Submit'}
              </button>
            </form>

            {/* Feedback box */}
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
        )}

        {/* Content: Solvers */}
        {challengeTab === 'solvers' && (
          <SolversList solvers={solvers} />
        )}
      </DialogContent>
      {/* Hint Dialog Modular */}
      <HintDialog
        challenge={showHintModal.challenge}
        hintIdx={showHintModal.hintIdx}
        open={!!showHintModal.challenge}
        onClose={() => setShowHintModal({ challenge: null })}
      />
    </Dialog>
  );
};

export default ChallengeDetailDialog;
