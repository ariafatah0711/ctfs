import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { Attachment, Challenge } from '@/types'

interface ChallengeFormDialogProps {
  open: boolean
  editing: Challenge | null
  formData: any
  submitting: boolean
  showPreview: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (e?: React.FormEvent) => void
  onChange: (data: any) => void
  onAddHint: () => void
  onUpdateHint: (i: number, v: string) => void
  onRemoveHint: (i: number) => void
  onAddAttachment: () => void
  onUpdateAttachment: (i: number, field: keyof Attachment, v: string) => void
  onRemoveAttachment: (i: number) => void
  setShowPreview: (v: boolean) => void
}

const ChallengeFormDialog: React.FC<ChallengeFormDialogProps> = ({
  open,
  editing,
  formData,
  submitting,
  showPreview,
  onOpenChange,
  onSubmit,
  onChange,
  onAddHint,
  onUpdateHint,
  onRemoveHint,
  onAddAttachment,
  onUpdateAttachment,
  onRemoveAttachment,
  setShowPreview,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border dark:border-gray-700 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">{editing ? 'Edit Challenge' : 'Add New Challenge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Title</Label>
              <Input required value={formData.title} onChange={e => onChange({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={v => onChange({ ...formData, category: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web">Web</SelectItem>
                  <SelectItem value="Reverse">Reverse</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Forensics">Forensics</SelectItem>
                  <SelectItem value="Pwn">Pwn</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" required value={String(formData.points)} onChange={e => onChange({ ...formData, points: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={v => onChange({ ...formData, difficulty: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Deskripsi</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Edit' : 'Preview'}</Button>
              </div>
              {showPreview ? (
                <div className="border rounded p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <MarkdownRenderer content={formData.description || '*No description provided*'} />
                </div>
              ) : (
                <Textarea required rows={5} value={formData.description} onChange={e => onChange({ ...formData, description: e.target.value })} className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" />
              )}
            </div>
            <div>
              <Label>Flag</Label>
              <Input required={!editing} value={formData.flag} onChange={e => onChange({ ...formData, flag: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'ctf{...}'} />
              <p className="text-xs text-muted-foreground mt-1">{editing ? 'Leave blank to keep current flag.' : 'Flag is required for new challenges.'}</p>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Hints</Label>
                <Button type="button" variant="ghost" size="sm" onClick={onAddHint}>+ Add</Button>
              </div>
              {formData.hint.length === 0 && <p className="text-xs text-muted-foreground">No hints added</p>}
              <div className="space-y-2 mt-2">
                {formData.hint.map((h: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={h} onChange={e => onUpdateHint(idx, e.target.value)} />
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
                {formData.attachments.map((a: Attachment, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-3" value={a.name} onChange={e => onUpdateAttachment(idx, 'name', e.target.value)} placeholder="File name / Label" required />
                    <Input className="col-span-6" value={a.url} onChange={e => onUpdateAttachment(idx, 'url', e.target.value)} placeholder="URL" required />
                    <Select value={a.type} onValueChange={v => onUpdateAttachment(idx, 'type', v as any)}>
                      <SelectTrigger className="col-span-2"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
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
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="dark:text-gray-100">Cancel</Button>
            <Button type="submit" disabled={submitting} className="dark:text-gray-100">{submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChallengeFormDialog
