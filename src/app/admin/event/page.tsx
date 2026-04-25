"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import { isGlobalAdmin, searchUsersByUsername, type UserLite } from '@/lib/admin'
import {
  adminAddEventMember,
  adminRemoveEventMember,
  addEvent,
  deleteEvent,
  getEvents,
  listEventMembers,
  listEventJoinRequests,
  regenerateEventJoinKey,
  reviewEventJoinRequest,
  setChallengesEvent,
  setEventJoinSettings,
  updateEvent,
} from '@/lib/events'
import { getChallengesLite } from '@/lib/challenges'
import { Event, EventJoinRequestRow, EventMemberRow } from '@/types'
// import ChallengeFilterBar from '@/components/challenges/ChallengeFilterBarFloating'
import ChallengeFilterBar from '@/app/challenges/_components/ChallengeFilterBarFloating'
import APP from '@/config'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { DIALOG_CONTENT_CLASS } from '@/styles/dialog'
import { Loader } from '@/shared/components'
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
  const [manageEventId, setManageEventId] = useState('')
  const [joinRequests, setJoinRequests] = useState<EventJoinRequestRow[]>([])
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false)
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null)
  const [eventMembers, setEventMembers] = useState<EventMemberRow[]>([])
  const [loadingEventMembers, setLoadingEventMembers] = useState(false)
  const [memberActionUserId, setMemberActionUserId] = useState<string | null>(null)
  const [assignUserQuery, setAssignUserQuery] = useState('')
  const [searchedUsers, setSearchedUsers] = useState<UserLite[]>([])
  const [loadingUserSearch, setLoadingUserSearch] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [selectedCandidateUserIds, setSelectedCandidateUserIds] = useState<string[]>([])

  const emptyForm = {
    name: '',
    description: '',
    join_mode: 'open' as 'open' | 'request' | 'key',
    join_key: '',
    start_time: '',
    end_time: '',
    always_show_challenges: false,
    image_url: '',
  }

  const [formData, setFormData] = useState<typeof emptyForm>(() => ({ ...emptyForm }))

  const loadEvents = async () => {
    const data = await getEvents()
    setEvents(data)
    if (!manageEventId && data.length > 0) {
      setManageEventId(data[0].id)
    }
  }

  const loadJoinRequests = async (eventId: string) => {
    if (!eventId) {
      setJoinRequests([])
      return
    }
    setLoadingJoinRequests(true)
    try {
      const data = await listEventJoinRequests(eventId, 'pending')
      setJoinRequests(data)
    } finally {
      setLoadingJoinRequests(false)
    }
  }

  const loadChallenges = async () => {
    const data = await getChallengesLite(true)
    setChallenges(data)
  }

  const loadEventMembers = async (eventId: string) => {
    if (!eventId) {
      setEventMembers([])
      return
    }
    setLoadingEventMembers(true)
    try {
      const data = await listEventMembers(eventId)
      setEventMembers(data)
    } finally {
      setLoadingEventMembers(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      if (!user) {
        router.push('/challenges')
        return
      }

      const adminCheck = await isGlobalAdmin()
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
      join_mode: evt.join_mode || 'open',
      join_key: evt.join_key || '',
      start_time: toInputValue(evt.start_time || null),
      end_time: toInputValue(evt.end_time || null),
      always_show_challenges: Boolean(evt.always_show_challenges),
      image_url: evt.image_url || '',
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
        always_show_challenges: formData.always_show_challenges,
        image_url: formData.image_url?.trim() || null,
      }

      if (editing?.id) {
        await updateEvent(editing.id, payload)
        await setEventJoinSettings(editing.id, formData.join_mode, formData.join_mode === 'key' ? formData.join_key.trim() : null)
        toast.success('Event updated')
      } else {
        const created = await addEvent(payload)
        const createdEventId = Array.isArray(created) ? created[0]?.id : created?.id
        if (createdEventId) {
          await setEventJoinSettings(createdEventId, formData.join_mode, formData.join_mode === 'key' ? formData.join_key.trim() : null)
        }
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

  const handleRegenerateJoinKey = async () => {
    if (!editing?.id) {
      toast.error('Save event first before regenerating key')
      return
    }
    try {
      const key = await regenerateEventJoinKey(editing.id)
      setFormData((prev) => ({ ...prev, join_key: key }))
      toast.success('Join key regenerated')
    } catch (err) {
      console.error(err)
      toast.error('Failed to regenerate join key')
    }
  }

  const handleReviewRequest = async (requestId: string, approve: boolean) => {
    if (!manageEventId) return
    setReviewingRequestId(requestId)
    try {
      await reviewEventJoinRequest(requestId, approve)
      await loadJoinRequests(manageEventId)
      await loadEventMembers(manageEventId)
      toast.success(approve ? 'Request approved' : 'Request rejected')
    } catch (err) {
      console.error(err)
      toast.error('Failed to review request')
    } finally {
      setReviewingRequestId(null)
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

  useEffect(() => {
    if (!manageEventId && sortedEvents.length > 0) {
      setManageEventId(sortedEvents[0].id)
      return
    }
    if (manageEventId) {
      void loadJoinRequests(manageEventId)
      void loadEventMembers(manageEventId)
    }
  }, [manageEventId, sortedEvents])

  useEffect(() => {
    const q = assignUserQuery.trim()

    if (!manageEventId || q.length < 2) {
      setSearchedUsers([])
      setLoadingUserSearch(false)
      return
    }

    let canceled = false
    setLoadingUserSearch(true)

    const timer = setTimeout(async () => {
      try {
        const data = await searchUsersByUsername(q, 12)
        if (canceled) return
        setSearchedUsers(data)
      } catch (err) {
        if (!canceled) {
          console.error(err)
          setSearchedUsers([])
        }
      } finally {
        if (!canceled) setLoadingUserSearch(false)
      }
    }, 250)

    return () => {
      canceled = true
      clearTimeout(timer)
    }
  }, [assignUserQuery, manageEventId])

  const handleQuickAddMember = async (targetUserId: string) => {
    if (!manageEventId) {
      toast.error('Select an event first')
      return
    }
    setMemberActionUserId(targetUserId)
    try {
      await adminAddEventMember(manageEventId, targetUserId)
      await loadEventMembers(manageEventId)
      setAssignUserQuery('')
      setSearchedUsers([])
      clearCandidateSelection()
      toast.success('Member added to event')
    } catch (err) {
      console.error(err)
      toast.error((err as any)?.message || 'Failed to add member')
    } finally {
      setMemberActionUserId(null)
    }
  }

  const toggleCandidateSelection = (targetUserId: string) => {
    setSelectedCandidateUserIds((prev) => {
      if (prev.includes(targetUserId)) {
        return prev.filter((id) => id !== targetUserId)
      }
      return [...prev, targetUserId]
    })
  }

  const selectAllCandidates = () => {
    setSelectedCandidateUserIds(candidateUsers.map((u) => u.id))
  }

  const clearCandidateSelection = () => {
    setSelectedCandidateUserIds([])
  }

  const handleQuickAddSelectedMembers = async () => {
    if (!manageEventId) {
      toast.error('Select an event first')
      return
    }

    if (selectedCandidateUserIds.length === 0) {
      toast.error('No user selected')
      return
    }

    setMemberActionUserId('__bulk__')
    try {
      await Promise.all(
        selectedCandidateUserIds.map((userId) => adminAddEventMember(manageEventId, userId))
      )
      await loadEventMembers(manageEventId)
      clearCandidateSelection()
      setAssignUserQuery('')
      setSearchedUsers([])
      toast.success(`${selectedCandidateUserIds.length} member(s) added to event`)
    } catch (err) {
      console.error(err)
      toast.error((err as any)?.message || 'Failed to add selected members')
    } finally {
      setMemberActionUserId(null)
    }
  }

  const handleRemoveMember = async (targetUserId: string) => {
    if (!manageEventId) return
    setMemberActionUserId(targetUserId)
    try {
      await adminRemoveEventMember(manageEventId, targetUserId)
      await loadEventMembers(manageEventId)
      toast.success('Member removed from event')
    } catch (err) {
      console.error(err)
      toast.error((err as any)?.message || 'Failed to remove member')
    } finally {
      setMemberActionUserId(null)
    }
  }

  const candidateUsers = useMemo(() => {
    const joinedSet = new Set(eventMembers.map((m) => m.user_id))

    return searchedUsers
      .filter((u) => !joinedSet.has(u.id))
      .slice(0, 8)
  }, [searchedUsers, eventMembers])

  const filteredEventMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase()
    if (!q) return eventMembers
    return eventMembers.filter((m) => {
      return m.username.toLowerCase().includes(q) || m.user_id.toLowerCase().includes(q)
    })
  }, [eventMembers, memberQuery])

  useEffect(() => {
    const visibleIds = new Set(candidateUsers.map((u) => u.id))
    setSelectedCandidateUserIds((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [candidateUsers])

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
                        {evt.always_show_challenges && (
                          <>
                            <span className="mx-2">•</span>
                            Always show challenges
                          </>
                        )}
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
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Event Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Event</Label>
              <select
                value={manageEventId}
                onChange={(e) => setManageEventId(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              >
                <option value="">Select event</option>
                {sortedEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Quick Assign User</Label>
                <Input
                  placeholder="Type username (min 2 chars)..."
                  value={assignUserQuery}
                  onChange={(e) => setAssignUserQuery(e.target.value)}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Search on demand. Tidak lagi memuat semua user sekaligus.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllCandidates}
                    disabled={candidateUsers.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearCandidateSelection}
                    disabled={selectedCandidateUserIds.length === 0}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleQuickAddSelectedMembers}
                    disabled={memberActionUserId === '__bulk__' || selectedCandidateUserIds.length === 0}
                  >
                    Add Selected ({selectedCandidateUserIds.length})
                  </Button>
                </div>
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  {manageEventId === '' ? (
                    <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">Select event first</div>
                  ) : assignUserQuery.trim().length < 2 ? (
                    <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">Type at least 2 characters to search users</div>
                  ) : loadingUserSearch ? (
                    <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">Searching users...</div>
                  ) : candidateUsers.length === 0 ? (
                    <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">No matching users (or all already members)</div>
                  ) : (
                    candidateUsers.map((u) => (
                      <div key={u.id} className="px-3 py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-primary-500"
                            checked={selectedCandidateUserIds.includes(u.id)}
                            onChange={() => toggleCandidateSelection(u.id)}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.id}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickAddMember(u.id)}
                          disabled={memberActionUserId === u.id}
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <Label>Current Members</Label>
                <Input
                  placeholder="Search current member..."
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  className="mt-2"
                />
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md max-h-[300px] overflow-auto">
                  {loadingEventMembers ? (
                    <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">Loading members...</div>
                  ) : filteredEventMembers.length === 0 ? (
                    <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">No members yet</div>
                  ) : (
                    filteredEventMembers.map((m) => (
                      <div key={m.user_id} className="px-3 py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{m.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.user_id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Joined: {new Date(m.joined_at).toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveMember(m.user_id)}
                          disabled={memberActionUserId === m.user_id}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
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

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Join Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Event</Label>
              <select
                value={manageEventId}
                onChange={(e) => setManageEventId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              >
                <option value="">Select event</option>
                {sortedEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              {loadingJoinRequests ? (
                <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading requests...</div>
              ) : joinRequests.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No pending requests</div>
              ) : (
                joinRequests.map((req) => (
                  <div key={req.request_id} className="px-3 py-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{req.username || req.user_id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Requested at {new Date(req.requested_at).toLocaleString()}</p>
                      {req.note && <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">Note: {req.note}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReviewRequest(req.request_id, true)}
                        disabled={reviewingRequestId === req.request_id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReviewRequest(req.request_id, false)}
                        disabled={reviewingRequestId === req.request_id}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <AnimatePresence>
        {openForm && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogContent
              className={`${DIALOG_CONTENT_CLASS} max-w-3xl p-4 md:p-8 max-h-[85dvh] overflow-y-auto scroll-hidden`}
              style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
            >
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label>Name</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    />
                  </div>

                  <div>
                    <Label>Join Mode</Label>
                    <select
                      value={formData.join_mode}
                      onChange={(e) => setFormData({ ...formData, join_mode: e.target.value as 'open' | 'request' | 'key' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                    >
                      <option value="open">Open (direct join)</option>
                      <option value="request">Request (admin approval)</option>
                      <option value="key">Key (invite key)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Join Key</Label>
                      {editing?.id && formData.join_mode === 'key' && (
                        <button
                          type="button"
                          onClick={handleRegenerateJoinKey}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          Regenerate
                        </button>
                      )}
                    </div>
                    <Input
                      value={formData.join_key}
                      onChange={(e) => setFormData({ ...formData, join_key: e.target.value })}
                      disabled={formData.join_mode !== 'key'}
                      placeholder={formData.join_mode === 'key' ? 'Enter custom join key' : 'Join key only for key mode'}
                      className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Start Time</Label>
                      {formData.start_time && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, start_time: '' })}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                      className="h-9 px-2 text-sm transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>End Time</Label>
                      {formData.end_time && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, end_time: '' })}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                      className="h-9 px-2 text-sm transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800/40">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Always show challenges</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Show event challenges after end.</p>
                    </div>
                    <Switch
                      checked={formData.always_show_challenges}
                      onCheckedChange={checked => setFormData({ ...formData, always_show_challenges: checked })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Image URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Add a banner image URL for this event</p>
                  </div>
                </div>

                <DialogFooter className="flex flex-row items-center justify-end gap-2 sticky bottom-0 z-10 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenForm(false)}
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
