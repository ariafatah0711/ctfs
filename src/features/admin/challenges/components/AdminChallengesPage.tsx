"use client"

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { Loader } from '@/shared/components'
import ConfirmDialog from '@/shared/components/custom/ConfirmDialog'
import { useAuth } from '@/shared/hooks'
import APP from '@/config'

import ChallengeFilterBar from '@/features/challenges/components/ChallengeFilterBar'
import ChallengeFormDialog from './ChallengeFormDialog'
import ChallengeListItem from './ChallengeListItem'
import ChallengeOverviewCard from './ChallengeOverviewCard'
import RecentSolversList from './RecentSolversList'
import { FlagPreviewDialog } from './FlagPreviewDialog'
import { useAdminChallengesData } from '../hooks/useAdminChallengesData'
import { useChallengeForm } from '../hooks/useChallengeForm'
import type { Challenge } from '../types'

export default function AdminChallengesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const {
    challenges,
    solvers,
    siteInfo,
    events,
    adminScope,
    isLoading: dataLoading,
    isRefreshing,
    initAdminData,
    toggleChallengeActive,
    toggleChallengeMaintenance,
    removeChallenge
  } = useAdminChallengesData()

  const {
    formData,
    setFormData,
    editing,
    subChallenges,
    subChallengesSequential,
    setSubChallengesSequential,
    submitting,
    showPreview,
    setShowPreview,
    resetForm,
    loadChallengeForEdit,
    handleSubmit,
    subChallengeOps,
    hintOps,
    attachmentOps,
    flagPreviewOpen,
    setFlagPreviewOpen,
    flagLoading,
    fetchedFlag,
    setFetchedFlag,
    handleViewFlag,
    questionPreviewRows,
    setQuestionPreviewRows,
    normalizeQuestionMarkdown
  } = useChallengeForm()

  // Local Page State
  const [openForm, setOpenForm] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Challenge | null>(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("")
  const [eventId, setEventId] = useState<string | null | 'all'>('all')
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    search: "",
    feature: "N" as 'T' | 'S' | 'N',
  })

  const isGlobalAdmin = adminScope?.is_global_admin ?? false

  // URL Params Effect
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/challenges')
      return
    }

    const init = async () => {
      await initAdminData()

      const urlEvent = searchParams.get('event')
      const urlAdd = searchParams.get('add') === '1'

      if (urlEvent) setEventId(urlEvent)
      if (urlAdd) {
        resetForm({ event_id: urlEvent && urlEvent !== 'all' ? urlEvent : null })
        setOpenForm(true)
      }
    }

    init()
  }, [user, authLoading, searchParams, initAdminData, router, resetForm])

  // Handlers
  const handleOpenAdd = () => {
    const defaultEventId = !isGlobalAdmin && typeof eventId === 'string' ? eventId : null
    resetForm({ event_id: defaultEventId })
    setOpenForm(true)
  }

  const handleOpenEdit = async (c: Challenge) => {
    await loadChallengeForEdit(c)
    setOpenForm(true)
  }

  const handleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const success = await handleSubmit()
    if (success) {
      setOpenForm(false)
      initAdminData(true) // Silent refresh list
    }
  }

  const handleAskDelete = (id: string) => {
    const ch = challenges.find(c => c.id === id)
    if (ch) {
      setPendingDelete(ch)
      setDeleteConfirmInput("")
      setConfirmOpen(true)
    }
  }

  // Memoized Filtered List
  const filteredChallenges = useMemo(() => {
    const allowedEventSet = new Set(adminScope?.event_ids ?? [])
    const manageable = isGlobalAdmin
      ? challenges
      : challenges.filter(c => c.event_id && allowedEventSet.has(String(c.event_id)))

    return manageable.filter(c => {
      if (eventId !== 'all') {
        const matchMain = eventId === null && !c.event_id
        const matchEvent = c.event_id === eventId
        if (!matchMain && !matchEvent) return false
      }
      if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.category !== "all" && c.category !== filters.category) return false
      if (filters.difficulty !== "all" && c.difficulty !== filters.difficulty) return false

      const hasQuestions = !!(c as any).has_questions
      const hasServices = Array.isArray((c as any).services) && (c as any).services.length > 0
      const featureType = hasQuestions && hasServices ? 'TS' : hasQuestions ? 'T' : hasServices ? 'S' : 'N'
      if (filters.feature === 'T' && !(featureType === 'T' || featureType === 'TS')) return false
      if (filters.feature === 'S' && !(featureType === 'S' || featureType === 'TS')) return false
      return true
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const catOrder = APP.challengeCategories || []
      const aIdx = catOrder.findIndex(c => c.toLowerCase() === (a.category || '').toLowerCase())
      const bIdx = catOrder.findIndex(c => c.toLowerCase() === (b.category || '').toLowerCase())
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
      return (a.category || '').localeCompare(b.category || '')
    })
  }, [challenges, adminScope, isGlobalAdmin, eventId, filters])

  if (authLoading || dataLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <motion.div className="lg:col-span-3 order-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>Challenge List</span>
                    {isRefreshing && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-orange-500 animate-pulse">
                        <div className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" />
                        SYNCING...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isGlobalAdmin && (
                      <>
                        <Link href="/admin/event"><Button variant="outline" size="sm">Events</Button></Link>
                        <Link href="/admin/admins"><Button variant="outline" size="sm">Roles</Button></Link>
                      </>
                    )}
                    <Button onClick={handleOpenAdd} size="sm">+ Add Challenge</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChallengeFilterBar
                  filters={filters}
                  categories={Array.from(new Set(challenges.map(c => c.category))).filter(Boolean).sort()}
                  difficulties={Array.from(new Set(challenges.map(c => c.difficulty)))}
                  onFilterChange={v => setFilters({ ...filters, ...v })}
                  onClear={() => setFilters({ category: "all", difficulty: "all", search: "", feature: "N" })}
                  events={events.map(e => ({ id: e.id, name: e.name, start_time: e.start_time, end_time: e.end_time }))}
                  selectedEventId={eventId}
                  onEventChange={setEventId}
                  hideAllEventOption={!isGlobalAdmin}
                  hideMainEventOption={!isGlobalAdmin}
                />

                <div className="mt-4 space-y-2">
                  {filteredChallenges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No challenges found</div>
                  ) : (
                    <div className="divide-y border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      {filteredChallenges.map(ch => (
                        <ChallengeListItem
                          key={ch.id}
                          challenge={ch}
                          onEdit={handleOpenEdit}
                          onDelete={handleAskDelete}
                          onViewFlag={handleViewFlag}
                          onToggleMaintenance={toggleChallengeMaintenance}
                          onToggleActive={toggleChallengeActive}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <aside className="lg:col-span-1 order-2 lg:order-none space-y-6 sticky top-0">
            <ChallengeOverviewCard
              challenges={challenges}
              info={isGlobalAdmin ? (siteInfo || undefined) : undefined}
              showViewAll={isGlobalAdmin}
            />
            <RecentSolversList solvers={solvers} onViewAll={() => router.push('/admin/solvers')} />
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {openForm && (
          <ChallengeFormDialog
            open={openForm}
            editing={editing}
            formData={formData}
            submitting={submitting}
            showPreview={showPreview}
            onOpenChange={v => { setOpenForm(v); if (!v) resetForm() }}
            onSubmit={handleFormSubmit}
            onChange={setFormData}
            onAddHint={hintOps.add}
            onUpdateHint={hintOps.update}
            onRemoveHint={hintOps.remove}
            onAddAttachment={attachmentOps.add}
            onUpdateAttachment={attachmentOps.update}
            onRemoveAttachment={attachmentOps.remove}
            subChallenges={subChallenges}
            subChallengesSequential={subChallengesSequential}
            onAddSubChallenge={subChallengeOps.add}
            onUpdateSubChallenge={subChallengeOps.update}
            onRemoveSubChallenge={subChallengeOps.remove}
            onReorderSubChallenge={subChallengeOps.reorder}
            onToggleSequential={setSubChallengesSequential}
            setShowPreview={setShowPreview}
            categories={APP.challengeCategories || []}
            events={events}
            hideMainEventOption={!isGlobalAdmin}
            flagLoading={flagLoading}
            handleViewFlag={handleViewFlag}
            questionPreviewRows={questionPreviewRows}
            setQuestionPreviewRows={setQuestionPreviewRows}
            normalizeQuestionMarkdown={normalizeQuestionMarkdown}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Challenge"
        description={
          <div className="space-y-4">
            <p>Are you sure you want to delete this challenge? This action cannot be undone.</p>
            {pendingDelete && (
              <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-sm">
                <p><b>Title:</b> {pendingDelete.title}</p>
                <p>Type <b>{pendingDelete.title}</b> to confirm:</p>
                <input
                  type="text"
                  className="w-full mt-2 px-3 py-2 border rounded bg-white dark:bg-gray-800"
                  value={deleteConfirmInput}
                  onChange={e => setDeleteConfirmInput(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (pendingDelete && deleteConfirmInput === pendingDelete.title) {
            await removeChallenge(pendingDelete.id)
            setConfirmOpen(false)
          } else {
            toast.error("Confirmation text does not match")
          }
        }}
      />
      <FlagPreviewDialog
        open={flagPreviewOpen}
        onOpenChange={(v) => {
          if (!v) {
            setFlagPreviewOpen(false);
            setFetchedFlag(null);
          }
        }}
        fetchedFlag={fetchedFlag}
      />
    </div>
  )
}
