'use client'

import { useState } from 'react'
import { FileText, Link as LinkIcon } from 'lucide-react'
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
          <p className="text-xs text-gray-400 inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Files
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              key="copy-wget-all"
              type="button"
              title="Copy wget commands for all files"
              className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded-md shadow transition"
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
              <span className="text-xs font-mono">
                {copiedAll[`${challenge.id}-copied`] ? 'Copied!' : 'copy wget'}
              </span>
            </button>

            <span className="text-gray-500">|</span>

            {challenge.attachments.filter((attachment) => attachment.type === 'file').map((attachment, idx) => {
              const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + '...' : attachment.name || 'file'
              const key = `${challenge.id}-${idx}`
              return (
                <button
                  key={key}
                  type="button"
                  title={attachment.name}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-md shadow"
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadFile(attachment, key)
                  }}
                  disabled={downloading[key]}
                >
                  {downloading[key] ? 'Downloading...' : displayName}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {challenge.attachments.some((attachment) => attachment.type !== 'file') && (
        <div>
          <p className="text-xs text-gray-400 inline-flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" /> Links
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
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-md shadow"
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
