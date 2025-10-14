"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ChallengeListItem from '@/components/admin/ChallengeListItem'
import ChallengeOverviewCard from '@/components/admin/ChallengeOverviewCard'
import RecentSolversList from '@/components/admin/RecentSolversList'
import ChallengeFormDialog from '@/components/admin/ChallengeFormDialog'

import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import ChallengeFilterBar from '@/components/challenges/ChallengeFilterBar'
// import MarkdownRenderer from '@/components/MarkdownRenderer' // unused
import Loader from "@/components/custom/loading"
import ConfirmDialog from '@/components/custom/ConfirmDialog'

import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/auth'
import { getChallenges, addChallenge, updateChallenge, setChallengeActive, deleteChallenge, getFlag, getSolversAll } from '@/lib/challenges'
import { getInfo } from '@/lib/users'
import { Challenge, Attachment } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  // const [isAdminUser, setIsAdminUser] = useState(false) // unused
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [solvers, setSolvers] = useState<any[]>([])
  const [siteInfo, setSiteInfo] = useState<any | null>(null)
  // const [solverOffset, setSolverOffset] = useState(0) // unused
  // const [hasMoreSolvers, setHasMoreSolvers] = useState(true) // unused

  // Dialog / form state
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<Challenge | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [pendingDeleteDetail, setPendingDeleteDetail] = useState<Challenge | null>(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("")

  const askDelete = (id: string) => {
    setPendingDelete(id)
    const ch = challenges.find((c) => c.id === id)
    setPendingDeleteDetail(ch || null)
    setDeleteConfirmInput("")
    setConfirmOpen(true)
  }

  const emptyForm = {
    title: '',
    description: '',
    category: 'Web',
    points: 100,
    max_points: 100,
    flag: '',
    hint: [] as string[],
    difficulty: 'Easy',
    attachments: [] as Attachment[],
    is_dynamic: false,
    min_points: 0,
    decay_per_solve: 0,
  }

  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    search: "",
  })

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      difficulty: "all",
      search: "",
    })
  }

  const [formData, setFormData] = useState(() => ({ ...emptyForm }))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      // if not logged in, redirect to challenges listing
      if (!user) {
        router.push('/challenges')
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      if (!adminCheck) {
        router.push('/challenges')
        return
      }

      const data = await getChallenges(undefined, true)
      const info = await getInfo()
      fetchSolvers(0)
      if (!mounted) return
      setChallenges(data)
      setSiteInfo(info)
    })()

    return () => { mounted = false }
  }, [user, loading, router])

  const openAdd = () => {
    setEditing(null)
    setFormData({ ...emptyForm })
    setOpenForm(true)
    setShowPreview(false)
  }

  const openEdit = (c: Challenge) => {
    // normalize hint to array
    let parsedHint: string[] = []
    if (Array.isArray(c.hint)) parsedHint = c.hint.filter(h => typeof h === 'string')
    else if (typeof c.hint === 'string' && c.hint.trim() !== '') {
      try {
        const arr = JSON.parse(c.hint as unknown as string)
        if (Array.isArray(arr)) parsedHint = arr.filter(h => typeof h === 'string')
        else parsedHint = [c.hint as unknown as string]
      } catch {
        parsedHint = [c.hint as unknown as string]
      }
    }

    setEditing(c)
    setFormData({
      title: c.title,
      description: c.description || '',
      category: c.category || 'Web',
      points: c.points || 100,
      max_points: c.max_points || c.points || 100,
      flag: c.flag || '',
      hint: parsedHint,
      difficulty: c.difficulty || 'Easy',
      attachments: c.attachments || [],
      is_dynamic: c.is_dynamic ?? false,
      min_points: c.min_points ?? 0,
      decay_per_solve: c.decay_per_solve ?? 0,
    })
    setOpenForm(true)
    setShowPreview(false)
  }

  // const refresh = async () => {
  //   const data = await getChallenges(undefined, true)
  //   setChallenges(data)
  // } // unused

  const fetchSolvers = async (offset = 0) => {
  const data = await getSolversAll(50, offset)
  setSolvers(prev => offset === 0 ? data : [...prev, ...data])
  }

  const handleViewFlag = async (id: string) => {
    const flag = await getFlag(id)
    if (flag) {
      toast.success(`Flag: ${flag}`)
    } else {
      toast.error('Failed to take flag or you are not admin.')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {
        title: (formData.title || '').trim(),
        description: (formData.description || '').trim(),
        category: (formData.category || '').trim(),
        points: Number(formData.points) || 0,
        hint: (formData.hint && formData.hint.length > 0) ? formData.hint.filter(h => h.trim() !== '') : null,
        difficulty: (formData.difficulty || '').trim(),
        attachments: (formData.attachments || []).filter((a) => (a.url || '').trim() !== ''),
  }
  if (typeof formData.is_dynamic !== 'undefined') payload.is_dynamic = formData.is_dynamic;
  if (typeof formData.min_points !== 'undefined') payload.min_points = Number(formData.min_points) || 0;
  if (typeof formData.decay_per_solve !== 'undefined') payload.decay_per_solve = Number(formData.decay_per_solve) || 0;

      if ((formData.flag || '').trim()) payload.flag = formData.flag.trim()

      if (formData.is_dynamic) {
        payload.max_points = Number(formData.max_points) || Number(formData.points) || 0;
      }
      if (editing) {
        await updateChallenge(editing.id, payload)
      } else {
        if (!formData.flag.trim()) {
          toast.error('Flag is required for new challenges')
          setSubmitting(false)
          return
        }
        payload.flag = formData.flag.trim()
        await addChallenge(payload)
      }

      const data = await getChallenges(undefined, true)
      setChallenges(data)
      setOpenForm(false)
      setEditing(null)
      setFormData({ ...emptyForm })
      toast.success('Challenge saved successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save challenge')
    } finally {
      setSubmitting(false)
    }
  }

  const doDelete = async (id: string) => {
    try {
      await deleteChallenge(id)
      const data = await getChallenges(undefined, true)
      setChallenges(data)
      toast.success('Challenge deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete challenge')
    }
  }

  const filteredChallenges = challenges.filter((c) => {
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category !== "all" && c.category !== filters.category) return false
    if (filters.difficulty !== "all" && c.difficulty !== filters.difficulty) return false
    return true
  })

  // hint handlers
  const addHint = () => setFormData(prev => ({ ...prev, hint: [...(prev.hint || []), ''] }))
  const updateHint = (i: number, v: string) => setFormData(prev => ({ ...prev, hint: prev.hint.map((h, idx) => idx === i ? v : h) }))
  const removeHint = (i: number) => setFormData(prev => ({ ...prev, hint: prev.hint.filter((_, idx) => idx !== i) }))

  // attachments
  const addAttachment = () => setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { name: '', url: '', type: 'file' }] }))
  const updateAttachment = (i: number, field: keyof Attachment, v: string) => setFormData(prev => ({ ...prev, attachments: prev.attachments.map((a, idx) => idx === i ? { ...a, [field]: v } : a) }))
  const removeAttachment = (i: number) => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Kiri: Challenge List */}
          <motion.div
            className="lg:col-span-3 order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Challenge List</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={openAdd}>+ Add Challenge</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <ChallengeFilterBar
                    filters={filters}
                    categories={Array.from(new Set(challenges.map(c => c.category)))}
                    difficulties={Array.from(new Set(challenges.map(c => c.difficulty)))}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    showStatusFilter={false}
                  />
                </div>
                {filteredChallenges.length === 0 ? (
                  <motion.div
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    No challenges found
                  </motion.div>
                ) : (
                  <motion.div
                    className="divide-y border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {filteredChallenges.map(ch => (
                      <ChallengeListItem
                        key={ch.id}
                        challenge={ch}
                        onEdit={openEdit}
                        onDelete={askDelete}
                        onViewFlag={handleViewFlag}
                        onToggleActive={async (id, checked) => {
                          const ok = await setChallengeActive(id, checked)
                          if (ok) {
                            setChallenges(prev => prev.map(c => c.id === id ? { ...c, is_active: checked } : c))
                            toast.success(`Challenge ${checked ? 'activated' : 'deactivated'}`)
                          }
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Kanan: Sidebar */}
          <motion.aside
            // className="lg:col-span-1 order-2 lg:order-none flex flex-col gap-6 h-auto lg:h-[calc(100vh-6rem)] overflow-y-auto sticky top-0 scroll-hidden"
            className="lg:col-span-1 order-2 lg:order-none flex flex-col gap-6 h-auto lg:h overflow-y-auto sticky top-0 scroll-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ChallengeOverviewCard challenges={challenges} info={siteInfo || undefined} />
            </motion.div>

            {/* Recent Solvers */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <RecentSolversList solvers={solvers} onViewAll={() => router.push('/admin/solvers')} />
            </motion.div>
          </motion.aside>
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
            onOpenChange={(v) => { if (!v) { setOpenForm(false); setEditing(null) } else setOpenForm(true) }}
            onSubmit={(e) => { e?.preventDefault(); handleSubmit(e) }}
            onChange={setFormData}
            onAddHint={addHint}
            onUpdateHint={updateHint}
            onRemoveHint={removeHint}
            onAddAttachment={addAttachment}
            onUpdateAttachment={updateAttachment}
            onRemoveAttachment={removeAttachment}
            setShowPreview={setShowPreview}
          />
        )}
      </AnimatePresence>

      {/* Confirm dialog outside of mapping so it's global */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Challenge"
        description={
          <div>
            <div className="mb-2">Are you sure you want to delete this challenge? This action cannot be undone.</div>
            {pendingDeleteDetail && (
              <>
                <div className="mt-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold flex flex-col gap-1">
                  <span>🏆 <b>Title:</b> <span className="font-mono">{pendingDeleteDetail.title}</span></span>
                  <span>📂 <b>Category:</b> <span className="font-mono">{pendingDeleteDetail.category}</span></span>
                  <span>⭐ <b>Points:</b> <span className="font-mono">{pendingDeleteDetail.is_dynamic ? `${pendingDeleteDetail.min_points}~${pendingDeleteDetail.max_points}` : pendingDeleteDetail.points}</span></span>
                  <span>🎯 <b>Difficulty:</b> <span className="font-mono">{pendingDeleteDetail.difficulty}</span></span>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type <b>{pendingDeleteDetail.title}</b> to confirm:
                  </label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    value={deleteConfirmInput}
                    onChange={e => setDeleteConfirmInput(e.target.value)}
                    autoFocus
                  />
                </div>
              </>
            )}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (pendingDelete) {
            await doDelete(pendingDelete)
            setPendingDelete(null)
            setPendingDeleteDetail(null)
            setDeleteConfirmInput("")
            setConfirmOpen(false)
          }
        }}
        // @ts-ignore
        confirmDisabled={!!pendingDeleteDetail && deleteConfirmInput !== pendingDeleteDetail.title}
      />
    </div>
  )
}
