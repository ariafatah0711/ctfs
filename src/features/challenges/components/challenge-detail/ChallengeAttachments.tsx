'use client'

import { useState } from 'react'
import { FileText, Link as LinkIcon, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Attachment, ChallengeWithSolve } from '@/shared/types'
import type { KeyedBooleanMap } from '../../types'

type ChallengeAttachmentsProps = {
  challenge: ChallengeWithSolve
  downloading: KeyedBooleanMap
  downloadFile: (attachment: Attachment, attachmentKey: string) => void
}

export default function ChallengeAttachments({
  challenge,
  downloading,
  downloadFile,
}: ChallengeAttachmentsProps) {
  const [copiedAll, setCopiedAll] = useState<Record<string, boolean>>({})

  if (!challenge.attachments || challenge.attachments.length === 0) return null

  return (
    <div className="space-y-3">
      {challenge.attachments.some((attachment) => attachment.type === 'file') && (
        <div>
          <p className="select-none text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5 opacity-80">
            <FileText className="h-4 w-4" />
            <span>Files</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              key="copy-wget-all"
              type="button"
              title="Copy wget commands for all files"
              className="select-none px-2.5 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition hover:bg-green-500/20"
              onClick={(event) => {
                event.stopPropagation()
                const fileAttachments = challenge.attachments!.filter((attachment) => attachment.type === 'file' && (attachment.url || attachment.name))
                if (!fileAttachments.length) return
                const commands = fileAttachments.map((attachment, idx) => {
                  const url = attachment.url || ''
                  const filename = (attachment.name && attachment.name.trim()) || url.split('/').pop() || `file-${idx}`
                  const escUrl = url.replace(/'/g, "'\\'\'")
                  const escName = filename.replace(/'/g, "'\\'\'")
                  return `wget '${escUrl}' -O '${escName}'`
                })
                const joined = commands.join(' && ')
                if (!navigator.clipboard) {
                  toast.error('Clipboard not available')
                  return
                }
                navigator.clipboard.writeText(joined).then(() => {
                  const key = `${challenge.id}-copied`
                  setCopiedAll((prev) => ({ ...prev, [key]: true }))
                  setTimeout(() => setCopiedAll((prev) => ({ ...prev, [key]: false })), 2000)
                  toast.success('Copied wget commands to clipboard')
                }).catch((error) => {
                  console.error('Copy failed', error)
                  toast.error('Failed to copy to clipboard')
                })
              }}
            >
              <span className="font-mono">
                {copiedAll[`${challenge.id}-copied`] ? 'Copied!' : 'copy wget'}
              </span>
            </button>

            <span className="select-none text-gray-500">|</span>

            {challenge.attachments.filter((attachment) => attachment.type === 'file').map((attachment, idx) => {
              const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + '...' : attachment.name || 'file'
              const key = `${challenge.id}-${idx}`
              return (
                <button
                  key={key}
                  type="button"
                  title={attachment.name}
                  className="flex select-none items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadFile(attachment, key)
                  }}
                  disabled={downloading[key]}
                >
                  <Download className="h-4 w-4 text-gray-400" />
                  {downloading[key] ? 'Downloading...' : displayName}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {challenge.attachments.some((attachment) => attachment.type !== 'file') && (
        <div>
          <p className="select-none text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5 opacity-80">
            <LinkIcon className="h-4 w-4" />
            <span>Links</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {challenge.attachments.filter((attachment) => attachment.type !== 'file').map((attachment, idx) => {
              const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + '...' : attachment.name || (attachment.url ? attachment.url.slice(0, 40) + '...' : 'link')
              return (
                <a
                  key={idx}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={attachment.url}
                  className="select-none px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-sm font-bold rounded-lg shadow-sm transition hover:bg-indigo-500/20"
                >
                  {displayName}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
