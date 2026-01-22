"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/auth'
import { addEvent, deleteEvent, getEvents, setChallengesEvent, updateEvent } from '@/lib/events'
import { getChallengesLite } from '@/lib/challenges'
import { Event } from '@/types'
import ChallengeFilterBar from '@/components/challenges/ChallengeFilterBar'
import APP from '@/config'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DIALOG_CONTENT_CLASS } from '@/styles/dialog'
import Loader from '@/components/custom/loading'
import ConfirmDialog from '@/components/custom/ConfirmDialog'
import BackButton from '@/components/custom/BackButton'

const toInputValue = (value?: string | null) => {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

const fromInputValue = (value: string) => {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

export default function AdminEventPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [challenges, setChallenges] = useState<Array<{ id: string; title: string; category?: string; difficulty?: string; event_id?: string | null; is_active?: boolean }>>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkEventId, setBulkEventId] = useState<string>('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: '',
  })

  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Event | null>(null)

  const emptyForm = {
    name: '',
    description: '',
    start_time: '',
    end_time: '',
  }

  const [formData, setFormData] = useState(() => ({ ...emptyForm }))

  const loadEvents = async () => {
    const data = await getEvents()
    setEvents(data)
  }

  const loadChallenges = async () => {
    const data = await getChallengesLite(true)
    setChallenges(data)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      if (!user) {
        router.push('/challenges')
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      setIsAdminUser(adminCheck)
      if (!adminCheck) {
        router.push('/challenges')
        return
      }

      await loadEvents()
      await loadChallenges()
    })()

    return () => {
      mounted = false
    }
  }, [user, loading, router])

  const openAdd = () => {
    setEditing(null)
    setFormData({ ...emptyForm })
    setOpenForm(true)
  }

  const openEdit = (evt: Event) => {
    setEditing(evt)
    setFormData({
      name: evt.name || '',
      description: evt.description || '',
      start_time: toInputValue(evt.start_time || null),
      end_time: toInputValue(evt.end_time || null),
    })
    setOpenForm(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Event name is required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        start_time: fromInputValue(formData.start_time),
        end_time: fromInputValue(formData.end_time),
      }

      if (editing?.id) {
        await updateEvent(editing.id, payload)
        toast.success('Event updated')
      } else {
        await addEvent(payload)
        toast.success('Event created')
      }

      await loadEvents()
      setOpenForm(false)
      setEditing(null)
      setFormData({ ...emptyForm })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  const askDelete = (evt: Event) => {
    setPendingDelete(evt)
    setConfirmOpen(true)
  }

  const doDelete = async () => {
    if (!pendingDelete?.id) return
    try {
      await deleteEvent(pendingDelete.id)
      await loadEvents()
      toast.success('Event deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete event')
    } finally {
      setPendingDelete(null)
      setConfirmOpen(false)
    }
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aTime = a.start_time ? new Date(a.start_time).getTime() : 0
      const bTime = b.start_time ? new Date(b.start_time).getTime() : 0
      return aTime - bTime
    })
  }, [events])

  const filteredChallenges = useMemo(() => {
    const q = (filters.search || '').toLowerCase()
    return challenges.filter(c => {
      if (q && !c.title.toLowerCase().includes(q)) return false
      if (filters.category !== 'all' && c.category !== filters.category) return false
      if (filters.difficulty !== 'all' && c.difficulty !== filters.difficulty) return false
      return true
    })
  }, [filters, challenges])

  const allCategories = useMemo(
    () => Array.from(new Set(challenges.map(c => c.category))).filter((c): c is string => Boolean(c)),
    [challenges]
  )
  const categories = useMemo(() => {
    const preferredOrder = APP.challengeCategories || []
    const matchedCategorySet = new Set<string>()
    return [
      ...preferredOrder.flatMap(p => {
        const pLower = p.toLowerCase()
        const found = allCategories.find(c => c.toLowerCase().includes(pLower) || pLower.includes(c.toLowerCase()))
        if (found && !matchedCategorySet.has(found)) {
          matchedCategorySet.add(found)
          return found
        }
        return [] as string[]
      }),
      ...allCategories.filter(c => !matchedCategorySet.has(c)).sort(),
    ]
  }, [allCategories])

  const difficulties = useMemo(
    () => Array.from(new Set(challenges.map(c => c.difficulty))).filter((d): d is string => Boolean(d)).sort(),
    [challenges]
  )

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const selectAllFiltered = () => {
    setSelectedIds(filteredChallenges.map(c => c.id))
  }

  const clearSelection = () => setSelectedIds([])

  const handleBulkAssign = async () => {
    if (!bulkEventId) {
      toast.error('Select an event first')
      return
    }
    if (selectedIds.length === 0) {
      toast.error('No challenges selected')
      return
    }
    setBulkSubmitting(true)
    try {
      await setChallengesEvent(bulkEventId, selectedIds)
      await loadChallenges()
      clearSelection()
      toast.success('Challenges assigned to event')
    } catch (err) {
      console.error(err)
      toast.error('Failed to assign challenges')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) {
      toast.error('No challenges selected')
      return
    }
    setBulkSubmitting(true)
    try {
      await setChallengesEvent(null, selectedIds)
      await loadChallenges()
      clearSelection()
      toast.success('Challenges moved to Main Event')
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove event from challenges')
    } finally {
      setBulkSubmitting(false)
    }
  }

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user || !isAdminUser) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <BackButton href="/admin" label="Go Back" />

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Event List</CardTitle>
              <Button onClick={openAdd} className="bg-primary-600 text-white hover:bg-primary-700">+ Add Event</Button>
          </CardHeader>
          <CardContent>
            {sortedEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">No events yet</div>
            ) : (
              <motion.div
                className="divide-y border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {sortedEvents.map(evt => (
                  <div key={evt.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-gray-900/40">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{evt.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                        {evt.description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {evt.start_time ? `Start: ${new Date(evt.start_time).toLocaleString()}` : 'Start: -'}
                        <span className="mx-2">•</span>
                        {evt.end_time ? `End: ${new Date(evt.end_time).toLocaleString()}` : 'End: -'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(evt)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => askDelete(evt)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-gray-900 dark:text-white">Bulk Assign Challenges</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-300">Select multiple challenges, then assign or remove event.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllFiltered}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <div className="flex-1">
                <Label>Target Event</Label>
                <select
                  value={bulkEventId}
                  onChange={e => setBulkEventId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                >
                  <option value="">Select event</option>
                  {sortedEvents.map(evt => (
                    <option key={evt.id} value={evt.id}>{evt.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleBulkAssign} disabled={bulkSubmitting} className="min-w-[96px]">Assign</Button>
                <Button variant="secondary" onClick={handleBulkRemove} disabled={bulkSubmitting} className="min-w-[120px]">Remove Event</Button>
              </div>
            </div>

            <div className="mt-3">
              <ChallengeFilterBar
                filters={filters}
                categories={categories}
                difficulties={difficulties}
                onFilterChange={setFilters}
                onClear={() => setFilters({ category: 'all', difficulty: 'all', search: '' })}
                showStatusFilter={false}
              />
            </div>

            <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md max-h-[360px] overflow-auto bg-white dark:bg-gray-800">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">No challenges found</div>
              ) : (
                filteredChallenges.map(ch => (
                  <label key={ch.id} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ch.id)}
                      onChange={() => toggleSelect(ch.id)}
                      className="h-4 w-4 accent-primary-500"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{ch.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                        {ch.category || 'Uncategorized'} • {ch.difficulty || 'Unknown'} • {ch.event_id ? 'Event' : 'Main'}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Selected: {selectedIds.length}</div>
          </CardContent>
        </Card>
      </main>

      <AnimatePresence>
        {openForm && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogContent className={`${DIALOG_CONTENT_CLASS} max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                      className="h-9 px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                      className="h-9 px-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                </div>
                <DialogFooter className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Event"
        description={
          <div>
            <div className="mb-2">Are you sure you want to delete this event? This action cannot be undone.</div>
            {pendingDelete && (
              <div className="mt-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold">
                {pendingDelete.name}
              </div>
            )}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={doDelete}
      />
    </div>
  )
}
