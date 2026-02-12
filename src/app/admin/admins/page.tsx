"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import { isGlobalAdmin, getEventAdmins, getGlobalAdmins, grantEventAdmin, revokeEventAdmin, searchUsersByUsername, type EventAdminRow, type UserLite } from '@/lib/admin'
import { getEvents } from '@/lib/events'
import { Event } from '@/types'

import Loader from '@/components/custom/loading'
import BackButton from '@/components/custom/BackButton'
import ConfirmDialog from '@/components/custom/ConfirmDialog'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminAdminsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [isAllowed, setIsAllowed] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  const [globalAdmins, setGlobalAdmins] = useState<UserLite[]>([])
  const [eventAdmins, setEventAdmins] = useState<EventAdminRow[]>([])

  // add form
  const [usernameQuery, setUsernameQuery] = useState('')
  const [userResults, setUserResults] = useState<UserLite[]>([])
  const [selectedUser, setSelectedUser] = useState<UserLite | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // remove confirm
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<EventAdminRow | null>(null)

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const loadAll = async () => {
    const [evts, gAdmins, eAdmins] = await Promise.all([
      getEvents(),
      getGlobalAdmins(),
      getEventAdmins(),
    ])
    setEvents(evts)
    setGlobalAdmins(gAdmins)
    setEventAdmins(eAdmins)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

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
    })()

    return () => {
      mounted = false
    }
  }, [user, loading, router])

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

  const selectedEvent = useMemo(() => events.find((e) => e.id === selectedEventId) || null, [events, selectedEventId])

  const askRemove = (row: EventAdminRow) => {
    setPendingRemove(row)
    setConfirmOpen(true)
  }

  const doRemove = async () => {
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
  }

  const canSubmit = !!selectedUser?.id && !!selectedEventId && !submitting

  const doGrant = async () => {
    if (!selectedUser?.id || !selectedEventId) return

    setSubmitting(true)
    try {
      const res = await grantEventAdmin(selectedUser.id, selectedEventId)
      if (!res.success) {
        toast.error(res.message || 'Failed to grant event admin')
        return
      }

      toast.success('Event admin added')
      setUsernameQuery('')
      setSelectedUser(null)
      setUserResults([])
      setSelectedEventId('')
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add event admin')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user || !isAllowed) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        <div className="mb-4">
          <BackButton href="/admin" label="Go Back" />
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Global Admins</CardTitle>
            </CardHeader>
            <CardContent>
              {globalAdmins.length === 0 ? (
                <div className="text-sm text-muted-foreground">No global admins found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>User ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalAdmins.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Event Admins</CardTitle>
            </CardHeader>
            <CardContent>
              {eventAdmins.length === 0 ? (
                <div className="text-sm text-muted-foreground">No event admins assigned yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="w-[120px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventAdmins.map((row) => (
                      <TableRow key={`${row.user_id}:${row.event_id}`}>
                        <TableCell className="font-medium">{row.username}</TableCell>
                        <TableCell>{row.event_name}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => askRemove(row)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Add Event Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Search Username</Label>
                  <div className="relative">
                    <Input
                      value={usernameQuery}
                      onChange={(e) => {
                        setUsernameQuery(e.target.value)
                        setSelectedUser(null)
                      }}
                      placeholder="Type username..."
                    />

                    {userResults.length > 0 && !selectedUser && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                        {userResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(u)
                              setUsernameQuery(u.username)
                              setUserResults([])
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{u.username}</span>
                              {u.is_admin ? (
                                <span className="text-xs text-muted-foreground">global admin</span>
                              ) : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Choose a user, then select an event.
                  </div>
                </div>

                <div>
                  <Label>Event</Label>
                  <Select value={selectedEventId} onValueChange={(v) => setSelectedEventId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedEvent ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Selected: <span className="font-medium">{selectedEvent.name}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={doGrant} disabled={!canSubmit}>
                  {submitting ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUsernameQuery('')
                    setSelectedUser(null)
                    setUserResults([])
                    setSelectedEventId('')
                  }}
                  disabled={submitting}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove Event Admin"
        description={
          pendingRemove ? (
            <div className="space-y-1">
              <div>
                Remove <b>{pendingRemove.username}</b> from event <b>{pendingRemove.event_name}</b>?
              </div>
              <div className="text-xs text-muted-foreground">This user will lose access to manage challenges for this event.</div>
            </div>
          ) : (
            'Are you sure?'
          )
        }
        confirmLabel="Remove"
        onConfirm={doRemove}
      />
    </div>
  )
}
