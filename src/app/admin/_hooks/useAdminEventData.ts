"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/hooks'
import APP from '@/config'
import {
  adminAddEventMember,
  adminRemoveEventMember,
  addEvent,
  deleteEvent,
  getChallengesLite,
  getEvents,
  isGlobalAdmin,
  listEventJoinRequests,
  listEventMembers,
  regenerateEventJoinKey,
  reviewEventJoinRequest,
  searchUsersByUsername,
  setChallengesEvent,
  setEventJoinSettings,
  updateEvent,
  type UserLite,
} from '../_lib'
import { Event, EventJoinRequestRow, EventMemberRow } from '../_types'

type ChallengeLite = { id: string; title: string; category?: string; difficulty?: string; event_id?: string | null; is_active?: boolean }
type FilterState = { category: string; difficulty: string; search: string; feature: 'T' | 'S' | 'N' }
type EventFormData = {
  name: string
  description: string
  join_mode: 'open' | 'request' | 'key'
  join_key: string
  start_time: string
  end_time: string
  always_show_challenges: boolean
  image_url: string
}

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

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

const EMPTY_FORM: EventFormData = {
  name: '',
  description: '',
  join_mode: 'open',
  join_key: '',
  start_time: '',
  end_time: '',
  always_show_challenges: false,
  image_url: '',
}

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  difficulty: 'all',
  search: '',
  feature: 'N',
}

export function useAdminEventData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [events, setEvents] = useState<Event[]>([])
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [challenges, setChallenges] = useState<ChallengeLite[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkEventId, setBulkEventId] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
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
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<EventFormData>({ ...EMPTY_FORM })

  const loadEvents = useCallback(async () => {
    const data = await getEvents()
    setEvents(data)
    setManageEventId((prev) => prev || data[0]?.id || '')
  }, [])

  const loadJoinRequests = useCallback(async (eventId: string) => {
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
  }, [])

  const loadChallenges = useCallback(async () => {
    const data = await getChallengesLite(true)
    setChallenges(data)
  }, [])

  const loadEventMembers = useCallback(async (eventId: string) => {
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
  }, [])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (authLoading) return
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
      if (mounted) setIsLoading(false)
    }
    init()
    return () => { mounted = false }
  }, [authLoading, user, router, loadEvents, loadChallenges])

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
  }, [manageEventId, sortedEvents, loadJoinRequests, loadEventMembers])

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
        if (!canceled) setSearchedUsers(data)
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

  const openAdd = useCallback(() => {
    setEditing(null)
    setFormData({ ...EMPTY_FORM })
    setOpenForm(true)
  }, [])

  const openEdit = useCallback((evt: Event) => {
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
  }, [])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
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
      setFormData({ ...EMPTY_FORM })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }, [formData, editing, loadEvents])

  const handleRegenerateJoinKey = useCallback(async () => {
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
  }, [editing])

  const handleReviewRequest = useCallback(async (requestId: string, approve: boolean) => {
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
  }, [manageEventId, loadJoinRequests, loadEventMembers])

  const askDelete = useCallback((evt: Event) => {
    setPendingDelete(evt)
    setConfirmOpen(true)
  }, [])

  const doDelete = useCallback(async () => {
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
  }, [pendingDelete, loadEvents])

  const clearCandidateSelection = useCallback(() => {
    setSelectedCandidateUserIds([])
  }, [])

  const handleQuickAddMember = useCallback(async (targetUserId: string) => {
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
      toast.error(getErrorMessage(err, 'Failed to add member'))
    } finally {
      setMemberActionUserId(null)
    }
  }, [manageEventId, loadEventMembers, clearCandidateSelection])

  const candidateUsers = useMemo(() => {
    const joinedSet = new Set(eventMembers.map((m) => m.user_id))
    return searchedUsers.filter((u) => !joinedSet.has(u.id)).slice(0, 8)
  }, [searchedUsers, eventMembers])

  const toggleCandidateSelection = useCallback((targetUserId: string) => {
    setSelectedCandidateUserIds((prev) => (prev.includes(targetUserId) ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId]))
  }, [])

  const selectAllCandidates = useCallback(() => {
    setSelectedCandidateUserIds(candidateUsers.map((u) => u.id))
  }, [candidateUsers])

  const handleQuickAddSelectedMembers = useCallback(async () => {
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
      await Promise.all(selectedCandidateUserIds.map((userId) => adminAddEventMember(manageEventId, userId)))
      await loadEventMembers(manageEventId)
      clearCandidateSelection()
      setAssignUserQuery('')
      setSearchedUsers([])
      toast.success(`${selectedCandidateUserIds.length} member(s) added to event`)
    } catch (err) {
      console.error(err)
      toast.error(getErrorMessage(err, 'Failed to add selected members'))
    } finally {
      setMemberActionUserId(null)
    }
  }, [manageEventId, selectedCandidateUserIds, loadEventMembers, clearCandidateSelection])

  const handleRemoveMember = useCallback(async (targetUserId: string) => {
    if (!manageEventId) return
    setMemberActionUserId(targetUserId)
    try {
      await adminRemoveEventMember(manageEventId, targetUserId)
      await loadEventMembers(manageEventId)
      toast.success('Member removed from event')
    } catch (err) {
      console.error(err)
      toast.error(getErrorMessage(err, 'Failed to remove member'))
    } finally {
      setMemberActionUserId(null)
    }
  }, [manageEventId, loadEventMembers])

  const filteredEventMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase()
    if (!q) return eventMembers
    return eventMembers.filter((m) => m.username.toLowerCase().includes(q) || m.user_id.toLowerCase().includes(q))
  }, [eventMembers, memberQuery])

  useEffect(() => {
    const visibleIds = new Set(candidateUsers.map((u) => u.id))
    setSelectedCandidateUserIds((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [candidateUsers])

  const filteredChallenges = useMemo(() => {
    const q = filters.search.toLowerCase()
    return challenges.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q)) return false
      if (filters.category !== 'all' && c.category !== filters.category) return false
      if (filters.difficulty !== 'all' && c.difficulty !== filters.difficulty) return false
      const hasQuestions = !!(c as any).has_questions
      const hasServices = Array.isArray((c as any).services) && (c as any).services.length > 0
      const featureType = hasQuestions && hasServices ? 'TS' : hasQuestions ? 'T' : hasServices ? 'S' : 'N'
      if (filters.feature === 'T' && !(featureType === 'T' || featureType === 'TS')) return false
      if (filters.feature === 'S' && !(featureType === 'S' || featureType === 'TS')) return false
      return true
    })
  }, [filters, challenges])

  const allCategories = useMemo(
    () => Array.from(new Set(challenges.map((c) => c.category))).filter((c): c is string => Boolean(c)),
    [challenges],
  )
  const categories = useMemo(() => {
    const preferredOrder = APP.challengeCategories || []
    const matchedCategorySet = new Set<string>()
    return [
      ...preferredOrder.flatMap((p) => {
        const pLower = p.toLowerCase()
        const found = allCategories.find((c) => c.toLowerCase().includes(pLower) || pLower.includes(c.toLowerCase()))
        if (found && !matchedCategorySet.has(found)) {
          matchedCategorySet.add(found)
          return found
        }
        return [] as string[]
      }),
      ...allCategories.filter((c) => !matchedCategorySet.has(c)).sort(),
    ]
  }, [allCategories])
  const difficulties = useMemo(
    () => Array.from(new Set(challenges.map((c) => c.difficulty))).filter((d): d is string => Boolean(d)).sort(),
    [challenges],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])
  const selectAllFiltered = useCallback(() => {
    setSelectedIds(filteredChallenges.map((c) => c.id))
  }, [filteredChallenges])
  const clearSelection = useCallback(() => setSelectedIds([]), [])

  const handleBulkAssign = useCallback(async () => {
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
  }, [bulkEventId, selectedIds, loadChallenges, clearSelection])

  const handleBulkRemove = useCallback(async () => {
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
  }, [selectedIds, loadChallenges, clearSelection])

  return {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    sortedEvents,
    manageEventId,
    setManageEventId,
    openForm,
    setOpenForm,
    editing,
    formData,
    setFormData,
    submitting,
    handleSubmit,
    handleRegenerateJoinKey,
    openAdd,
    openEdit,
    askDelete,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    doDelete,
    assignUserQuery,
    setAssignUserQuery,
    loadingUserSearch,
    candidateUsers,
    selectedCandidateUserIds,
    toggleCandidateSelection,
    selectAllCandidates,
    clearCandidateSelection,
    handleQuickAddSelectedMembers,
    memberActionUserId,
    handleQuickAddMember,
    memberQuery,
    setMemberQuery,
    loadingEventMembers,
    filteredEventMembers,
    handleRemoveMember,
    filters,
    setFilters,
    categories,
    difficulties,
    selectAllFiltered,
    clearSelection,
    bulkEventId,
    setBulkEventId,
    handleBulkAssign,
    handleBulkRemove,
    bulkSubmitting,
    filteredChallenges,
    selectedIds,
    toggleSelect,
    joinRequests,
    loadingJoinRequests,
    reviewingRequestId,
    handleReviewRequest,
  }
}
