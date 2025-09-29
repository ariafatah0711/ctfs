import React from 'react'
import { useState } from 'react'
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

  // ✅ Pindahkan useState ke sini
  const [categories, setCategories] = useState<string[]>([
    "Web", "Reverse", "Crypto", "Forensics", "Pwn", "Misc", "Osint"
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border dark:border-gray-700 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">{editing ? 'Edit Challenge' : 'Add New Challenge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 flex items-center gap-4">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.is_dynamic}
                  onChange={e => onChange({ ...formData, is_dynamic: e.target.checked })}
                  className="mr-2"
                />
                Dynamic Scoring
              </Label>
            </div>
            <div>
              <Label>Title</Label>
              <Input required value={formData.title} onChange={e => onChange({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={v => onChange({ ...formData, category: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                </SelectContent>
              </Select>
            </div>
            {/* Points field only if NOT dynamic */}
            {!formData.is_dynamic && (
              <div>
                <Label>Points</Label>
                <Input type="number" required min={0} value={formData.points ?? ''} onChange={e => onChange({ ...formData, points: Number(e.target.value) })} />
              </div>
            )}

            {/* Dynamic Score Fields only if dynamic */}
            {formData.is_dynamic && (
              <>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  <div className="flex flex-col">
                    <Label htmlFor="max_points" className="mb-1">Max Points</Label>
                    <Input
                      id="max_points"
                      type="number"
                      min={0}
                      value={formData.max_points ?? ''}
                      onChange={e => onChange({ ...formData, max_points: Number(e.target.value) })}
                      className="w-full"
                      placeholder="Nilai awal"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="min_points" className="mb-1">Min Points</Label>
                    <Input
                      id="min_points"
                      type="number"
                      min={0}
                      value={formData.min_points ?? ''}
                      onChange={e => onChange({ ...formData, min_points: Number(e.target.value) })}
                      className="w-full"
                      placeholder="Batas minimum"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:col-span-2">
                  <div className="flex flex-col">
                    <Label htmlFor="decay_per_solve" className="mb-1">Decay/Solve</Label>
                    <Input
                      id="decay_per_solve"
                      type="number"
                      min={0}
                      value={formData.decay_per_solve ?? ''}
                      onChange={e => onChange({ ...formData, decay_per_solve: Number(e.target.value) })}
                      className="w-full"
                      placeholder="Turun tiap solve"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="mb-1">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={v => onChange({ ...formData, difficulty: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">Dynamic score: <b>Max Points</b> (nilai awal), <b>Min Points</b> (batas bawah), <b>Decay/Solve</b> (penurunan per solve)</span>
              </>
            )}

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
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-700"
            >
              {submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChallengeFormDialog
