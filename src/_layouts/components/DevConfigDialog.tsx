"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, Plus, Save, Settings2, X, AlertCircle, CheckCircle2, FileJson, Key, Info } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Badge,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { DIALOG_CONTENT_CLASS_3XL } from "@/shared/styles"

type SetupConfig = {
  shortName: string
  fullName: string
  description: string
  flagFormat: string
  challengeCategories: string[]
  notifSolves: boolean
  teamsEnabled: boolean
  hideScoreboardIndividual: boolean
  hideScoreboardTotal: boolean
  hideEventMain: boolean
  eventMainLabel: string
  eventMainImageUrl: string
  eventFallbackImageUrl: string
}

type SecretConfig = {
  supabaseUrl: string
  supabaseAnonKey: string
  turnstileSiteKey: string
  turnstileSiteKeyEnabled: boolean
  nxctlEnabled: boolean
  nxctlApiUrl: string
  nxctlApiToken: string
}

const emptyConfig: SetupConfig = {
  shortName: '',
  fullName: '',
  description: '',
  flagFormat: '',
  challengeCategories: [],
  notifSolves: false,
  teamsEnabled: false,
  hideScoreboardIndividual: false,
  hideScoreboardTotal: false,
  hideEventMain: false,
  eventMainLabel: '',
  eventMainImageUrl: '',
  eventFallbackImageUrl: '',
}

const emptySecret: SecretConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  turnstileSiteKey: '',
  turnstileSiteKeyEnabled: false,
  nxctlEnabled: false,
  nxctlApiUrl: '',
  nxctlApiToken: '',
}

interface DevConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DevConfigDialog({ open, onOpenChange }: DevConfigDialogProps) {
  const [config, setConfig] = useState<SetupConfig>(emptyConfig)
  const [secret, setSecret] = useState<SecretConfig>(emptySecret)
  const [activeTab, setActiveTab] = useState<'config' | 'secret'>('config')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [categoryDraft, setCategoryDraft] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (!open) return
    loadConfig()
  }, [open])

  const loadConfig = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/config', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to load config')
      setConfig(data.config)
      setSecret(data.secret || emptySecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = activeTab === 'config' ? config : { secret }
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to save')

      if (activeTab === 'config') setConfig(data.config)
      else setSecret(data.secret || emptySecret)

      setMessage('Successfully saved!')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const updateField = <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const updateSecretField = <K extends keyof SecretConfig>(key: K, value: SecretConfig[K]) => {
    setSecret((current) => ({ ...current, [key]: value }))
  }

  const toggleField = (key: keyof Pick<SetupConfig, 'notifSolves' | 'teamsEnabled' | 'hideScoreboardIndividual' | 'hideScoreboardTotal' | 'hideEventMain'>) => {
    setConfig((current) => ({ ...current, [key]: !current[key] }))
  }

  const toggleSecretField = (key: keyof Pick<SecretConfig, 'turnstileSiteKeyEnabled' | 'nxctlEnabled'>) => {
    setSecret((current) => ({ ...current, [key]: !current[key] }))
  }

  const addCategory = () => {
    const value = categoryDraft.trim()
    if (!value) return
    setConfig((current) => {
      if (current.challengeCategories.some(c => c.toLowerCase() === value.toLowerCase())) return current
      return { ...current, challengeCategories: [...current.challengeCategories, value] }
    })
    setCategoryDraft('')
  }

  const removeCategory = (value: string) => {
    setConfig((current) => ({
      ...current,
      challengeCategories: current.challengeCategories.filter(c => c !== value),
    }))
  }

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setConfig((current) => {
      const oldIndex = current.challengeCategories.indexOf(String(active.id))
      const newIndex = current.challengeCategories.indexOf(String(over.id))
      return { ...current, challengeCategories: arrayMove(current.challengeCategories, oldIndex, newIndex) }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DIALOG_CONTENT_CLASS_3XL, "max-h-[90vh] overflow-hidden flex flex-col p-0 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900")}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Platform Setup</DialogTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className="bg-orange-600 text-white border-none text-[10px] py-0.5 px-2 font-black uppercase">Dev Only</Badge>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
                  <Info size={12} />
                  {activeTab === 'config' ? 'src/config.ts' : '.env.local'}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={saveConfig}
            disabled={saving || loading}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-bold h-10 px-8 transition-all active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-800"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex gap-2">
          <TabButton
            active={activeTab === 'config'}
            onClick={() => setActiveTab('config')}
            label="Application"
            icon={<FileJson size={16} />}
          />
          <TabButton
            active={activeTab === 'secret'}
            onClick={() => setActiveTab('secret')}
            label="Infrastructure"
            icon={<Key size={16} />}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-hidden">
          <AnimatePresence mode="wait">
            {(message || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-4 rounded-xl border flex items-center gap-3",
                  message ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                )}
              >
                {message ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-bold">{message || error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-sm font-medium uppercase tracking-widest">Loading...</p>
            </div>
          ) : activeTab === 'config' ? (
            <div className="space-y-10">
              <Section title="Identity & Branding" description="Core platform naming and flag rules.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Short Name</Label>
                    <Input value={config.shortName} onChange={(e) => updateField('shortName', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                  <div className="lg:col-span-3">
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Full Platform Name</Label>
                    <Input value={config.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Flag Format</Label>
                    <Input value={config.flagFormat} onChange={(e) => updateField('flagFormat', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Description</Label>
                    <Input value={config.description} onChange={(e) => updateField('description', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                </div>
              </Section>

              <Section title="Challenge Categories" description="Manage challenge classifications.">
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Input
                      value={categoryDraft}
                      onChange={(e) => setCategoryDraft(e.target.value)}
                      placeholder="Add new category..."
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-11 shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <Button onClick={addCategory} size="icon" className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 h-11 w-11 rounded-lg"><Plus className="w-6 h-6" /></Button>
                  </div>
                  <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleCategoryDragEnd}>
                    <SortableContext items={config.challengeCategories} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-wrap gap-2">
                        {config.challengeCategories.map((cat) => (
                          <SortableCategoryItem key={cat} id={cat} label={cat} onRemove={() => removeCategory(cat)} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </Section>

              <Section title="Feature Flags" description="Enable or disable platform modules.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ToggleItem title="Solve Notifications" desc="Real-time solve popups." checked={config.notifSolves} onToggle={() => toggleField('notifSolves')} />
                  <ToggleItem title="Enable Teams" desc="Enable team registration and management." checked={config.teamsEnabled} onToggle={() => toggleField('teamsEnabled')} />
                  <ToggleItem title="Hide Individual Ranking" desc="Hide personal scores from scoreboard." checked={config.hideScoreboardIndividual} onToggle={() => toggleField('hideScoreboardIndividual')} />
                  <ToggleItem title="Hide Scoreboard Total" desc="Hide the overall team scoreboard rank." checked={config.hideScoreboardTotal} onToggle={() => toggleField('hideScoreboardTotal')} />
                </div>
              </Section>

              <Section title="Event Showcase" description="Configure the default event section.">
                <div className="space-y-6">
                  <ToggleItem title="Show Event Default/Main" desc="Display the main event if no event_id is specified." checked={!config.hideEventMain} onToggle={() => toggleField('hideEventMain')} />
                  <div className="grid gap-6">
                    <div>
                      <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Event Label</Label>
                      <Input value={config.eventMainLabel} onChange={(e) => updateField('eventMainLabel', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                    </div>
                    <div>
                      <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Banner Image URL</Label>
                      <Input value={config.eventMainImageUrl} onChange={(e) => updateField('eventMainImageUrl', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                    </div>
                    <div>
                      <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Fallback Banner</Label>
                      <Input value={config.eventFallbackImageUrl} onChange={(e) => updateField('eventFallbackImageUrl', e.target.value)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          ) : (
            <div className="space-y-10">
              <Section title="Database Engine" description="Supabase connection credentials.">
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Project URL</Label>
                    <Input value={secret.supabaseUrl} onChange={(e) => updateSecretField('supabaseUrl', e.target.value)} className="font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                  <div>
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Anon Public Key</Label>
                    <Input value={secret.supabaseAnonKey} onChange={(e) => updateSecretField('supabaseAnonKey', e.target.value)} className="font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                </div>
              </Section>

              <Section title="Orchestrator" description="Automation for challenge instances.">
                <div className="space-y-6">
                  <ToggleItem title="Enable Orchestrator" desc="Active NXCTL integration." checked={secret.nxctlEnabled} onToggle={() => toggleSecretField('nxctlEnabled')} />
                  <div className={cn("grid gap-6 transition-all duration-300", !secret.nxctlEnabled && "opacity-40 pointer-events-none scale-[0.98]")}>
                    <div>
                      <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">API Endpoint</Label>
                      <Input value={secret.nxctlApiUrl} onChange={(e) => updateSecretField('nxctlApiUrl', e.target.value)} className="font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                    </div>
                    <div>
                      <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Access Token</Label>
                      <Input type="password" value={secret.nxctlApiToken} onChange={(e) => updateSecretField('nxctlApiToken', e.target.value)} className="font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Security" description="Captcha and anti-bot protection.">
                <div className="space-y-6">
                  <ToggleItem title="Cloudflare Turnstile" desc="Verify users are human." checked={secret.turnstileSiteKeyEnabled} onToggle={() => toggleSecretField('turnstileSiteKeyEnabled')} />
                  <div className={cn("transition-all duration-300", !secret.turnstileSiteKeyEnabled && "opacity-40 pointer-events-none scale-[0.98]")}>
                    <Label className="mb-2 block text-gray-700 dark:text-gray-200 font-bold">Site Key</Label>
                    <Input value={secret.turnstileSiteKey} onChange={(e) => updateSecretField('turnstileSiteKey', e.target.value)} className="font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white h-10" />
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-orange-600 pl-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-none">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{description}</p>
      </div>
      <div className="bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        {children}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
        active
          ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-gray-800"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function ToggleItem({ title, desc, checked, onToggle }: { title: string; desc: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all hover:border-orange-600/30">
      <div className="pr-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-tight mt-1">{desc}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-orange-600"
      />
    </div>
  )
}

function SortableCategoryItem({ id, label, onRemove }: { id: string; label: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 pl-2.5 pr-3 py-2 rounded-xl text-sm font-bold transition-all",
        isDragging ? "shadow-2xl border-orange-600 scale-110 z-50 ring-4 ring-orange-600/10" : "hover:border-gray-300 dark:hover:border-gray-600"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-orange-600">
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="text-gray-900 dark:text-gray-100">{label}</span>
      <button onClick={onRemove} className="ml-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
