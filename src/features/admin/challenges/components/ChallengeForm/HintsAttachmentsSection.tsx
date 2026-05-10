import React from 'react'
import { Label, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { Attachment, ChallengeFormData } from '../../types'

interface HintsAttachmentsSectionProps {
  formData: ChallengeFormData
  onAddHint: () => void
  onUpdateHint: (i: number, v: string) => void
  onRemoveHint: (i: number) => void
  onAddAttachment: () => void
  onUpdateAttachment: (i: number, f: keyof Attachment, v: string) => void
  onRemoveAttachment: (i: number) => void
}

export const HintsAttachmentsSection: React.FC<HintsAttachmentsSectionProps> = ({
  formData,
  onAddHint,
  onUpdateHint,
  onRemoveHint,
  onAddAttachment,
  onUpdateAttachment,
  onRemoveAttachment
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between">
          <Label>Hints</Label>
          <Button type="button" variant="ghost" size="sm" onClick={onAddHint}>+ Add</Button>
        </div>
        {formData.hint.length === 0 && <p className="text-xs text-muted-foreground">No hints added</p>}
        <div className="space-y-2 mt-2">
          {formData.hint.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input value={h} onChange={e => onUpdateHint(idx, e.target.value)} className="transition-colors bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm" />
              <Button type="button" variant="ghost" onClick={() => onRemoveHint(idx)}>✕</Button>
            </div>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between">
          <Label>Attachments</Label>
          <Button type="button" variant="ghost" size="sm" onClick={onAddAttachment}>+ Add</Button>
        </div>
        <div className="space-y-2 mt-2">
          {formData.attachments.map((a, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-3 transition-colors bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm" value={a.name} onChange={e => onUpdateAttachment(idx, 'name', e.target.value)} placeholder="File name / Label" required />
              <Input className="col-span-6 transition-colors bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm" value={a.url} onChange={e => onUpdateAttachment(idx, 'url', e.target.value)} placeholder="URL" required />
              <Select value={a.type} onValueChange={(v: 'file' | 'link') => onUpdateAttachment(idx, 'type', v)}>
                <SelectTrigger className="col-span-2 transition-colors bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" onClick={() => onRemoveAttachment(idx)} className="col-span-1">✕</Button>
            </div>
          ))}
          {formData.attachments.length === 0 && (
            <p className="text-xs text-muted-foreground">No attachments added</p>
          )}
        </div>
      </div>
    </div>
  )
}
