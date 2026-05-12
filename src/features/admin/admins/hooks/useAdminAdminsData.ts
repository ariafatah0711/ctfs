"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import {
  getEventAdmins,
  getEvents,
  getGlobalAdmins,
  grantEventAdmin,
  isGlobalAdmin,
  revokeEventAdmin,
  searchUsersByUsername,
} from '../lib'
import type { Event, EventAdminRow, UserLite } from '../types'

export function useAdminAdminsData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [isAllowed, setIsAllowed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [globalAdmins, setGlobalAdmins] = useState<UserLite[]>([])
  const [eventAdmins, setEventAdmins] = useState<EventAdminRow[]>([])
  const [usernameQuery, setUsernameQuery] = useState('')
  const [userResults, setUserResults] = useState<UserLite[]>([])
  const [selectedUser, setSelectedUser] = useState<UserLite | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<EventAdminRow | null>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const loadAll = useCallback(async () => {
    const [evts, gAdmins, eAdmins] = await Promise.all([
      getEvents(),
      getGlobalAdmins(),
      getEventAdmins(),
    ])
    setEvents(evts)
    setGlobalAdmins(gAdmins)
    setEventAdmins(eAdmins)
  }, [])

  const resetGrantForm = useCallback(() => {
    setUsernameQuery('')
    setSelectedUser(null)
    setUserResults([])
    setSelectedEventId('')
  }, [])

  useEffect(() => {
    let mounted = true

    const initAdminsData = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/challenges')
        return
      }

      const ok = await isGlobalAdmin()
      if (!mounted) return

      setIsAllowed(ok)
      if (!ok) {
        router.push('/challenges')
        return
      }

      await loadAll()
      if (!mounted) return
      setIsLoading(false)
    }

    initAdminsData()

    return () => {
      mounted = false
    }
  }, [authLoading, user, router, loadAll])

  useEffect(() => {
    if (!isAllowed) return

    const q = usernameQuery.trim()
    if (!q) {
      setUserResults([])
      setSelectedUser(null)
      return
    }

    if (selectedUser && selectedUser.username.toLowerCase() === q.toLowerCase()) {
      setUserResults([])
      return
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = setTimeout(async () => {
      const results = await searchUsersByUsername(q, 8)
      setUserResults(results)
    }, 250)

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [usernameQuery, selectedUser, isAllowed])

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId],
  )

  const canSubmit = !!selectedUser?.id && !!selectedEventId && !submitting

  const askRemove = useCallback((row: EventAdminRow) => {
    setPendingRemove(row)
    setConfirmOpen(true)
  }, [])

  const doRemove = useCallback(async () => {
    if (!pendingRemove) return
    try {
      await revokeEventAdmin(pendingRemove.user_id, pendingRemove.event_id)
      toast.success('Event admin removed')
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove event admin')
    } finally {
      setPendingRemove(null)
    }
  }, [pendingRemove, loadAll])

  const doGrant = useCallback(async () => {
    if (!selectedUser?.id || !selectedEventId) return

    setSubmitting(true)
    try {
      const res = await grantEventAdmin(selectedUser.id, selectedEventId)
      if (!res.success) {
        toast.error(res.message || 'Failed to grant event admin')
        return
      }

      toast.success('Event admin added')
      resetGrantForm()
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add event admin')
    } finally {
      setSubmitting(false)
    }
  }, [selectedUser, selectedEventId, resetGrantForm, loadAll])

  return {
    user,
    authLoading,
    isLoading,
    isAllowed,
    events,
    globalAdmins,
    eventAdmins,
    usernameQuery,
    setUsernameQuery,
    userResults,
    setUserResults,
    selectedUser,
    setSelectedUser,
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
    submitting,
    canSubmit,
    confirmOpen,
    setConfirmOpen,
    pendingRemove,
    askRemove,
    doRemove,
    doGrant,
    resetGrantForm,
  }
}
