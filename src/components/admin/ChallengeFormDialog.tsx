import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Flag } from 'lucide-react'
import { Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Attachment, Challenge } from '@/types'
import { getFlag } from '@/lib/challenges'
import APP from '@/config'

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
  categories: string[]
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
  categories,
}) => {

  // small modal for viewing flag in the form
  const [flagPreviewOpen, setFlagPreviewOpen] = useState(false)
  const [flagLoading, setFlagLoading] = useState(false)
  const [fetchedFlag, setFetchedFlag] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-xl rounded-xl [&_button.absolute.right-4.top-4] p-4 md:p-8 max-h-[90vh] overflow-y-auto scroll-hidden"
        style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">{editing ? 'Edit Challenge' : 'Add New Challenge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 flex items-center gap-4">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={!!formData.is_dynamic}
                  onCheckedChange={v => {
                    // Sinkronkan points <-> max_points saat toggle
                    if (v) {
                      // Aktifkan dynamic: set max_points = points jika ada
                      onChange({
                        ...formData,
                        is_dynamic: true,
                        max_points: formData.points ?? '',
                      });
                    } else {
                      // Nonaktifkan dynamic: set points = max_points jika ada
                      onChange({
                        ...formData,
                        is_dynamic: false,
                        points: formData.max_points ?? '',
                      });
                    }
                  }}
                  className="mr-2 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500 bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-500 transition-colors"
                />
                Dynamic Scoring
              </Label>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                required
                value={formData.title}
                onChange={e => onChange({ ...formData, title: e.target.value })}
                className="transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={v => onChange({ ...formData, category: v })}>
                <SelectTrigger className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectContent>
              </Select>
            </div>

            {/* Points & Difficulty (static) */}
            {!formData.is_dynamic && (
              <>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={formData.points === undefined || formData.points === null ? '' : formData.points}
                    onChange={e => {
                      let val = e.target.value.replace(/^0+(?=\d)/, '');
                      if (val === '') {
                        onChange({ ...formData, points: '', max_points: '' });
                      } else {
                        onChange({ ...formData, points: Number(val), max_points: Number(val) });
                      }
                    }}
                    className="transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <Label className="mb-1">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={v => onChange({ ...formData, difficulty: v })}>
                      <SelectTrigger className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                        {/* Generate difficulty options from config to keep consistent */}
                        {Object.keys((APP as any).difficultyStyles || {}).map(key => {
                          const label = key.charAt(0).toUpperCase() + key.slice(1)
                          const value = label
                          return (<SelectItem key={key} value={value}>{label}</SelectItem>)
                        })}
                      </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Dynamic Score Fields & Difficulty (dynamic) */}
            {formData.is_dynamic && (
              <>
                <div>
                  <Label htmlFor="max_points" className="mb-1">Max Points</Label>
                  <Input
                    id="max_points"
                    type="number"
                    min={0}
                    value={formData.max_points === undefined || formData.max_points === null ? '' : formData.max_points}
                    onChange={e => {
                      let val = e.target.value.replace(/^0+(?=\d)/, '');
                      if (val === '') {
                        onChange({ ...formData, max_points: '', points: '' });
                      } else {
                        onChange({ ...formData, max_points: Number(val), points: Number(val) });
                      }
                    }}
                    className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    placeholder="Nilai awal"
                  />
                </div>
                <div>
                  <Label className="mb-1">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={v => onChange({ ...formData, difficulty: v })}>
                      <SelectTrigger className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                        {Object.keys((APP as any).difficultyStyles || {}).map(key => {
                          const label = key.charAt(0).toUpperCase() + key.slice(1)
                          const value = label
                          return (<SelectItem key={key} value={value}>{label}</SelectItem>)
                        })}
                      </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="min_points" className="mb-1">Min Points</Label>
                  <Input
                    id="min_points"
                    type="number"
                    min={0}
                    value={formData.min_points === undefined || formData.min_points === null ? '' : formData.min_points}
                    onChange={e => {
                      let val = e.target.value.replace(/^0+(?=\d)/, '');
                      let maxVal = (formData.max_points === undefined || formData.max_points === null || formData.max_points === '') ? 0 : Number(formData.max_points);
                      if (val === '') {
                        onChange({ ...formData, min_points: '' });
                      } else {
                        let minVal = Number(val);
                        if (minVal > maxVal) {
                          minVal = maxVal;
                        }
                        onChange({ ...formData, min_points: minVal });
                      }
                    }}
                    className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    placeholder="Batas minimum"
                  />
                  {formData.max_points !== '' && formData.min_points > formData.max_points && (
                    <p className="text-xs text-red-500 mt-1">Min Points tidak boleh lebih dari Max Points</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="decay_per_solve" className="mb-1">Decay/Solve</Label>
                  <Input
                    id="decay_per_solve"
                    type="number"
                    min={0}
                    value={formData.decay_per_solve === undefined || formData.decay_per_solve === null ? '' : formData.decay_per_solve}
                    onChange={e => {
                      let val = e.target.value.replace(/^0+(?=\d)/, '');
                      if (val === '') {
                        onChange({ ...formData, decay_per_solve: '' });
                      } else {
                        onChange({ ...formData, decay_per_solve: Number(val) });
                      }
                    }}
                    className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    placeholder="Turun tiap solve"
                  />
                </div>
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
                <Textarea required rows={5} value={formData.description} onChange={e => onChange({ ...formData, description: e.target.value })} className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm scroll-hidden" />
              )}
            </div>
            <div className="md:col-span-2">
              <Label>Flag</Label>
              {/* <div className="grid grid-cols-12 gap-2 pointer-events-auto"> */}
              <div className="flex gap-2 pointer-events-auto">
                <Input required={!editing} value={formData.flag} onChange={e => onChange({ ...formData, flag: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'ctf{...}'} className="col-span-11 transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm" />
                <Button
                  aria-label="Show flag"
                  title="Show flag"
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    try {
                      if (editing && editing.id) {
                        setFlagLoading(true)
                        const flag = await getFlag(editing.id)
                        setFlagLoading(false)
                        if (flag) {
                          setFetchedFlag(flag)
                          setFlagPreviewOpen(true)
                        } else {
                          toast.error('Unable to fetch flag (permission or error)')
                        }
                      } else {
                        setFetchedFlag(formData.flag || null)
                        setFlagPreviewOpen(true)
                      }
                    } catch (err) {
                      setFlagLoading(false)
                      console.error(err)
                      toast.error('Failed to fetch flag')
                    }
                  }}
                  disabled={flagLoading || (!editing && !formData.flag)}
                  className="flex-none pointer-events-auto text-gray-800 dark:text-gray-200"
                >
                  {flagLoading ? <span className="animate-pulse">…</span> : <Flag size={18} />}
                </Button>
              </div>
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
          {/* <DialogFooter className="flex flex-row items-center justify-end gap-2 sticky bottom-0 bg-white dark:bg-gray-900 z-10 pt-2"> */}
          <DialogFooter className="flex flex-row items-center justify-end gap-2 sticky bottom-0 z-10 pt-2">
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

    {/* Flag preview modal rendered as a sibling Dialog (portal) */}
    <Dialog
      open={flagPreviewOpen}
      onOpenChange={(v) => {
        if (!v) {
          setFlagPreviewOpen(false);
          setFetchedFlag(null);
          setCopySuccess(false);
        }
      }}
    >
      <DialogContent className="bg-[#232344] dark:bg-gray-900 rounded-md shadow-2xl max-w-xl min-w-[320px] w-full border border-[#35355e] dark:border-gray-700 p-6 font-mono [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white" style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}>
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-sm text-gray-700 dark:text-gray-200">Flag:</div>
          <Button
            type="button"
            onClick={async () => {
              const flag = fetchedFlag ?? formData.flag ?? "";
              await navigator.clipboard.writeText(flag);
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 2000);
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 transition-colors"
            disabled={!(fetchedFlag ?? formData.flag)}
          >
            {copySuccess ? (<><Check size={14} /> Copied!</>) : (<><Flag size={14} /> Copy Flag</>)}
          </Button>
        </div>
        <div className="font-mono text-sm bg-indigo-50 dark:bg-gray-800 p-3 rounded break-all border-2 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100">
          {fetchedFlag ?? formData.flag ?? "(empty)"}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default ChallengeFormDialog
