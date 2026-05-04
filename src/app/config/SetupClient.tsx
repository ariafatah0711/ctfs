"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Save, Settings2, X } from 'lucide-react'

import { Loader } from '@/shared/components'
import { BackButton } from '@/shared/components/custom'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'

type SetupConfig = {
  shortName: string
  fullName: string
  description: string
  flagFormat: string
  baseUrl: string
  challengeCategories: string[]
  notifSolves: boolean
  challengeTutorial: boolean
  chatBotAI: boolean
  live2dMaskotAnime: boolean
  teamsEnabled: boolean
  hideScoreboardIndividual: boolean
  hideScoreboardTotal: boolean
  hideEventMain: boolean
  eventMainLabel: string
  eventMainImageUrl: string
  maintenanceMode: 'no' | 'yes' | 'auto'
  maintenanceMessage: string
}

const emptyConfig: SetupConfig = {
  shortName: '',
  fullName: '',
  description: '',
  flagFormat: '',
  baseUrl: '',
  challengeCategories: [],
  notifSolves: false,
  challengeTutorial: false,
  chatBotAI: false,
  live2dMaskotAnime: false,
  teamsEnabled: false,
  hideScoreboardIndividual: false,
  hideScoreboardTotal: false,
  hideEventMain: false,
  eventMainLabel: '',
  eventMainImageUrl: '',
  maintenanceMode: 'no',
  maintenanceMessage: '',
}

export default function SetupClient() {
  const [config, setConfig] = useState<SetupConfig>(emptyConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [categoryDraft, setCategoryDraft] = useState('')

  useEffect(() => {
    let active = true

    const loadConfig = async (showResetMessage = false) => {
      try {
        const response = await fetch('/api/config', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load config')
        }

        if (active) {
          setConfig(data.config)
          setMessage(showResetMessage ? 'Changes discarded and reloaded.' : '')
          setError('')
        }
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : 'Failed to load config')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadConfig()

    return () => {
      active = false
    }
  }, [])

  const resetConfig = async () => {
    setResetting(true)
    setError('')
    try {
      const response = await fetch('/api/config', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to reload config')
      }

      setConfig(data.config)
      setMessage('Changes discarded and reloaded.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reload config')
    } finally {
      setResetting(false)
    }
  }

  const updateField = <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const addCategory = () => {
    const value = categoryDraft.trim()
    if (!value) return

    setConfig((current) => {
      const exists = current.challengeCategories.some(
        (category) => category.toLowerCase() === value.toLowerCase()
      )

      if (exists) return current
      return {
        ...current,
        challengeCategories: [...current.challengeCategories, value],
      }
    })

    setCategoryDraft('')
  }

  const removeCategory = (value: string) => {
    setConfig((current) => ({
      ...current,
      challengeCategories: current.challengeCategories.filter(
        (category) => category !== value
      ),
    }))
  }

  const toggleField = (key: keyof Pick<SetupConfig, 'notifSolves' | 'challengeTutorial' | 'chatBotAI' | 'live2dMaskotAnime' | 'teamsEnabled' | 'hideScoreboardIndividual' | 'hideScoreboardTotal' | 'hideEventMain'>) => {
    setConfig((current) => ({ ...current, [key]: !current[key] }))
  }

  const saveConfig = async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          challengeCategories: config.challengeCategories,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save config')
      }

      setConfig(data.config)
      setMessage('config.ts updated successfully.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save config')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader fullscreen color="text-orange-500" />

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <BackButton label="Back" />
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className="border border-orange-200 bg-orange-50 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-700 dark:border-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                  >
                    Dev only
                  </Badge>
                  <span>/config</span>
                </div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Settings2 className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                  Config
                </CardTitle>
                <CardDescription>
                  This page edits <span className="font-mono">src/config.ts</span> and is only available in development.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={saveConfig}
                    disabled={saving || resetting}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetConfig}
                    disabled={saving || resetting}
                  >
                    {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {resetting ? 'Resetting...' : 'Reset'}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          {(message || error) && (
            <CardFooter className="flex-col items-start gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              {message && (
                <div className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  {message}
                </div>
              )}
              {error && (
                <div className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
                  {error}
                </div>
              )}
            </CardFooter>
          )}
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings2 className="h-5 w-5 text-orange-600" />
                Main identity
              </CardTitle>
              <CardDescription>Core values shown across the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Short name">
                <Input value={config.shortName} onChange={(event) => updateField('shortName', event.target.value)} placeholder="FGTE" />
              </Field>
              <Field label="Full name">
                <Input value={config.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="CTFS Platform" />
              </Field>
              <Field label="Description">
                <Textarea value={config.description} onChange={(event) => updateField('description', event.target.value)} rows={4} placeholder="Aplikasi CTF minimalis..." />
              </Field>
              <Field label="Flag format">
                <Input value={config.flagFormat} onChange={(event) => updateField('flagFormat', event.target.value)} placeholder="FGTE{...}" />
              </Field>
              <Field label="Base URL fallback">
                <Input value={config.baseUrl} onChange={(event) => updateField('baseUrl', event.target.value)} placeholder="http://localhost:3000" />
              </Field>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Challenge categories</CardTitle>
              <CardDescription>Add or remove categories one by one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Add category">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={categoryDraft}
                    onChange={(event) => setCategoryDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addCategory()
                      }
                    }}
                    placeholder="Intro"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addCategory}
                    disabled={!categoryDraft.trim()}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </Field>
              <div className="flex flex-wrap gap-2">
                {config.challengeCategories.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No categories added yet.</p>
                ) : (
                  config.challengeCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="gap-2 border border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700 dark:border-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="rounded-full p-1 text-orange-600 transition hover:bg-orange-100 dark:text-orange-200 dark:hover:bg-orange-800/40"
                        aria-label={`Remove ${category}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Feature toggles</CardTitle>
              <CardDescription>Quick switches for common app features.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ToggleRow label="Notification solves" checked={config.notifSolves} onChange={() => toggleField('notifSolves')} />
              <ToggleRow label="Challenge tutorial" checked={config.challengeTutorial} onChange={() => toggleField('challengeTutorial')} />
              <ToggleRow label="ChatBot AI" checked={config.chatBotAI} onChange={() => toggleField('chatBotAI')} />
              <ToggleRow label="Live2D mascot" checked={config.live2dMaskotAnime} onChange={() => toggleField('live2dMaskotAnime')} />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Teams and events</CardTitle>
              <CardDescription>Controls for team scoreboard and event display.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ToggleRow label="Teams enabled" checked={config.teamsEnabled} onChange={() => toggleField('teamsEnabled')} />
              <ToggleRow label="Hide individual scoreboard" checked={config.hideScoreboardIndividual} onChange={() => toggleField('hideScoreboardIndividual')} />
              <ToggleRow label="Hide total team scoreboard" checked={config.hideScoreboardTotal} onChange={() => toggleField('hideScoreboardTotal')} />
              <ToggleRow label="Hide main event" checked={config.hideEventMain} onChange={() => toggleField('hideEventMain')} />
              <div className="sm:col-span-2 space-y-4">
                <Field label="Event main label">
                  <Input value={config.eventMainLabel} onChange={(event) => updateField('eventMainLabel', event.target.value)} placeholder="FGTE 2026" />
                </Field>
                <Field label="Event main image URL">
                  <Input value={config.eventMainImageUrl} onChange={(event) => updateField('eventMainImageUrl', event.target.value)} placeholder="https://..." />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Maintenance</CardTitle>
              <CardDescription>Maintenance mode is still stored in config.ts.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <Field label="Mode">
                <Select value={config.maintenanceMode} onValueChange={(value) => updateField('maintenanceMode', value as SetupConfig['maintenanceMode'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">no</SelectItem>
                    <SelectItem value="yes">yes</SelectItem>
                    <SelectItem value="auto">auto</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Message">
                <Textarea value={config.maintenanceMessage} onChange={(event) => updateField('maintenanceMessage', event.target.value)} rows={5} placeholder="Platform sedang maintenance..." />
              </Field>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
            <CardDescription>Things this config page does not edit directly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Environment values</p>
              <p className="mt-1">CAPTCHA and Supabase keys still come from <span className="font-mono">.env.local</span>.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Main app</p>
              <p className="mt-1">Open the main web on <span className="font-mono">http://localhost:3000</span> after saving.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</Label>
      {children}
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
