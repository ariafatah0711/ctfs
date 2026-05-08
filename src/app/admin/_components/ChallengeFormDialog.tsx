import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowDown, ArrowUp, Check, Flag, GripVertical, Plus, Trash2 } from 'lucide-react'
import { MarkdownRenderer } from '@/shared/components'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/shared/ui'
import { DIALOG_CONTENT_CLASS, DIALOG_CONTENT_CLASS_XL } from "@/shared/styles"
import { getFlag } from '../_lib'
import { Attachment, Challenge, ChallengeFormData, Event, SubChallengeFormRow } from '../_types'
import APP from '@/config'

interface ChallengeFormDialogProps {
  open: boolean
  editing: Challenge | null
  formData: ChallengeFormData
  submitting: boolean
  showPreview: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (e?: React.FormEvent) => void
  onChange: React.Dispatch<React.SetStateAction<ChallengeFormData>>
  onAddHint: () => void
  onUpdateHint: (i: number, v: string) => void
  onRemoveHint: (i: number) => void
  onAddAttachment: () => void
  onUpdateAttachment: (i: number, field: keyof Attachment, v: string) => void
  onRemoveAttachment: (i: number) => void
  subChallenges: SubChallengeFormRow[]
  subChallengesSequential: boolean
  onAddSubChallenge: () => void
  onUpdateSubChallenge: (i: number, field: keyof SubChallengeFormRow, value: string | number | boolean) => void
  onRemoveSubChallenge: (i: number) => void
  onReorderSubChallenge: (fromIndex: number, toIndex: number) => void
  onToggleSubChallengesSequential: (v: boolean) => void
  setShowPreview: (v: boolean) => void
  categories: string[]
  events?: Event[]
  hideMainEventOption?: boolean
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
  subChallenges,
  subChallengesSequential,
  onAddSubChallenge,
  onUpdateSubChallenge,
  onRemoveSubChallenge,
  onReorderSubChallenge,
  onToggleSubChallengesSequential,
  setShowPreview,
  categories,
  events,
  hideMainEventOption = false,
}) => {
  const normalizeQuestionMarkdown = (value: string) => {
    const trimmed = String(value ?? '').trim()
    const wrappedInQuotes = (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('“') && trimmed.endsWith('”'))
    return wrappedInQuotes ? trimmed.slice(1, -1).trim() : trimmed
  }

  const sortedEvents = React.useMemo(() => {
    if (!events) return []

    const nowMs = Date.now()

    const getLabel = (evt: Event) => String(evt?.name ?? 'Untitled')

    const getState = (evt: Event) => {
      const start = evt?.start_time ? new Date(evt.start_time).getTime() : null
      const end = evt?.end_time ? new Date(evt.end_time).getTime() : null

      // Permanent = no start & no end
      if (!start && !end) return 'permanent' as const
      // Ended
      if (end && nowMs > end) return 'ended' as const
      // Upcoming
      if (start && nowMs < start) return 'upcoming' as const
      // Ongoing
      return 'ongoing' as const
    }

    const statePriority: Record<ReturnType<typeof getState>, number> = {
      permanent: 0,
      ongoing: 1,
      upcoming: 2,
      ended: 3,
    }

    const safeTime = (t: number | null) => (typeof t === 'number' && !Number.isNaN(t) ? t : null)

    return [...events].sort((a: Event, b: Event) => {
      const stateA = getState(a)
      const stateB = getState(b)
      if (stateA !== stateB) return statePriority[stateA] - statePriority[stateB]

      const aStart = safeTime(a?.start_time ? new Date(a.start_time).getTime() : null)
      const bStart = safeTime(b?.start_time ? new Date(b.start_time).getTime() : null)
      const aEnd = safeTime(a?.end_time ? new Date(a.end_time).getTime() : null)
      const bEnd = safeTime(b?.end_time ? new Date(b.end_time).getTime() : null)

      if (stateA === 'permanent') {
        const aKey = aStart ?? 0
        const bKey = bStart ?? 0
        return aKey - bKey || getLabel(a).localeCompare(getLabel(b))
      }

      if (stateA === 'ongoing') {
        const aKey = aEnd ?? Infinity
        const bKey = bEnd ?? Infinity
        return aKey - bKey || getLabel(a).localeCompare(getLabel(b))
      }

      if (stateA === 'upcoming') {
        const aKey = aStart ?? Infinity
        const bKey = bStart ?? Infinity
        return aKey - bKey || getLabel(a).localeCompare(getLabel(b))
      }

      if (stateA === 'ended') {
        const aKey = aEnd ?? 0
        const bKey = bEnd ?? 0
        return bKey - aKey || getLabel(a).localeCompare(getLabel(b))
      }

      return 0
    })
  }, [events])

  // small modal for viewing flag in the form
  const [flagPreviewOpen, setFlagPreviewOpen] = useState(false)
  const [flagLoading, setFlagLoading] = useState(false)
  const [fetchedFlag, setFetchedFlag] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [draggedSubChallengeIndex, setDraggedSubChallengeIndex] = useState<number | null>(null)
  const [questionPreviewRows, setQuestionPreviewRows] = useState<Record<number, boolean>>({})

  const moveSubChallenge = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    if (toIndex < 0 || toIndex >= subChallenges.length) return
    onReorderSubChallenge(fromIndex, toIndex)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={DIALOG_CONTENT_CLASS + " max-w-3xl p-4 md:p-8 max-h-[85dvh] overflow-y-auto scroll-hidden"}
          style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
        >
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">{editing ? 'Edit Challenge' : 'Add New Challenge'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 flex flex-wrap items-center gap-4">
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
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active !== false}
                    onCheckedChange={v => {
                      onChange({
                        ...formData,
                        is_active: v,
                      });
                    }}
                    className="mr-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-500 transition-colors"
                  />
                  Active
                </Label>
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={!!formData.is_maintenance}
                    onCheckedChange={v => {
                      onChange({
                        ...formData,
                        is_maintenance: v,
                      });
                    }}
                    className="mr-2 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-500 transition-colors"
                  />
                  Maintenance
                </Label>
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={!!formData.flag_placeholder}
                    onCheckedChange={v => {
                      onChange({
                        ...formData,
                        flag_placeholder: v,
                      });
                    }}
                    className="mr-2 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-500 transition-colors"
                  />
                  Flag Placeholder
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

              {events && (
                <div>
                  <Label>Event</Label>
                  <Select
                    value={formData.event_id ?? '__main__'}
                    onValueChange={v => onChange({ ...formData, event_id: v === '__main__' ? null : v })}
                  >
                    <SelectTrigger className="w-full transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                      {!hideMainEventOption && (
                        <SelectItem value="__main__">{String(APP.eventMainLabel || 'Main')}</SelectItem>
                      )}
                      {sortedEvents.map((evt: Event) => (
                        <SelectItem key={evt.id} value={evt.id}>{String(evt?.name ?? 'Untitled')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                        {Object.keys(APP.difficultyStyles || {}).map(key => {
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
                        {Object.keys(APP.difficultyStyles || {}).map(key => {
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
                    {formData.max_points !== '' && Number(formData.min_points) > Number(formData.max_points) && (
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
                  <Label>CTFC Services</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...formData, services: [...formData.services, ''] })}>+ Add Service</Button>
                </div>
                {formData.services.length === 0 && <p className="text-xs text-muted-foreground">No CTFC services added</p>}
                <div className="space-y-2 mt-2">
                  {formData.services.map((name: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input value={name} onChange={e => {
                        const newNames = [...formData.services];
                        newNames[idx] = e.target.value;
                        onChange({ ...formData, services: newNames });
                      }} placeholder="service-name" />
                      <Button type="button" variant="ghost" onClick={() => {
                        const newNames = [...formData.services];
                        newNames.splice(idx, 1);
                        onChange({ ...formData, services: newNames });
                      }}>✕</Button>
                    </div>
                  ))}
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
                      <Select value={a.type} onValueChange={(v: 'file' | 'link') => onUpdateAttachment(idx, 'type', v)}>
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

              <div className="md:col-span-2 space-y-3 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/40">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Label className="text-sm font-semibold">Sub-Challenges</Label>
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={subChallengesSequential}
                        onCheckedChange={onToggleSubChallengesSequential}
                        className="mr-1 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500 bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-500 transition-colors"
                      />
                      Sequential
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddSubChallenge}
                      className="gap-1"
                    >
                      <Plus size={14} />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {subChallenges.length === 0 && (
                    <p className="text-xs text-muted-foreground">No sub-challenges yet.</p>
                  )}

                  {subChallenges.map((row, idx) => (
                    <div
                      key={row.id || idx}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (draggedSubChallengeIndex === null) return
                        moveSubChallenge(draggedSubChallengeIndex, idx)
                        setDraggedSubChallengeIndex(null)
                      }}
                      className={`grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_auto] gap-3 items-start rounded-md border bg-white dark:bg-gray-900 p-3 transition ${draggedSubChallengeIndex === idx
                        ? 'border-primary-400 opacity-70'
                        : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-2 md:w-12 md:flex-col md:items-center md:gap-1 md:pt-4 md:self-start">
                        <span className="min-w-8 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 md:w-full">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = 'move'
                            setDraggedSubChallengeIndex(idx)
                          }}
                          onDragEnd={() => setDraggedSubChallengeIndex(null)}
                          className="cursor-grab rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing dark:hover:bg-gray-800 dark:hover:text-gray-200"
                          title="Drag"
                          aria-label="Drag sub-challenge"
                        >
                          <GripVertical size={16} />
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSubChallenge(idx, idx - 1)}
                          disabled={idx === 0}
                          aria-label="Move up"
                          title="Move up"
                        >
                          <ArrowUp size={15} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSubChallenge(idx, idx + 1)}
                          disabled={idx === subChallenges.length - 1}
                          aria-label="Move down"
                          title="Move down"
                        >
                          <ArrowDown size={15} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveSubChallenge(idx)}
                          aria-label="Remove"
                          title="Remove"
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>

                      <div className="space-y-3 min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-xs">Question</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setQuestionPreviewRows(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="h-6 px-2 text-[10px]"
                            >
                              {questionPreviewRows[idx] ? 'Edit' : 'Preview'}
                            </Button>
                          </div>
                          {questionPreviewRows[idx] ? (
                            <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-2 text-sm dark:border-gray-700 dark:bg-gray-800/70">
                              <div className="max-w-full overflow-hidden break-words text-sm font-semibold [&_p]:m-0 [&_p]:text-sm [&_p]:leading-snug [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0">
                                <MarkdownRenderer content={normalizeQuestionMarkdown(row.question || '*No question yet*')} className="max-w-full break-words" />
                              </div>
                            </div>
                          ) : (
                            <Textarea
                              required
                              rows={3}
                              value={row.question}
                              onChange={e => onUpdateSubChallenge(idx, 'question', e.target.value)}
                              placeholder="Question text, markdown supported"
                              className="mt-1 h-24 min-h-[84px] resize-none overflow-y-auto transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                            />
                          )}
                        </div>

                        <div>
                          <Label className="text-xs">Answer</Label>
                          <Input
                            required
                            value={row.answer}
                            onChange={e => onUpdateSubChallenge(idx, 'answer', e.target.value)}
                            placeholder="Plaintext answer"
                            className="transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
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
        <DialogContent className={DIALOG_CONTENT_CLASS_XL} style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}>
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
