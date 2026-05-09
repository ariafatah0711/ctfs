"use client"

import React from 'react'

import { Loader } from '@/shared/components'
import { customComponents } from '@/shared/components'
import { AddEventAdminCard } from '../_components'
import { useAdminAdminsData } from '../_hooks'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

export default function AdminAdminsPage() {
  const { BackButton, ConfirmDialog } = customComponents
  const {
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
  } = useAdminAdminsData()

  if (authLoading || isLoading) return <Loader fullscreen color="text-orange-500" />
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

          <AddEventAdminCard
            events={events}
            usernameQuery={usernameQuery}
            userResults={userResults}
            selectedUser={selectedUser}
            selectedEventId={selectedEventId}
            selectedEventName={selectedEvent?.name ?? null}
            submitting={submitting}
            canSubmit={canSubmit}
            onUsernameChange={(value) => {
              setUsernameQuery(value)
              setSelectedUser(null)
            }}
            onUserSelect={(u) => {
              setSelectedUser(u)
              setUsernameQuery(u.username)
              setUserResults([])
            }}
            onEventChange={setSelectedEventId}
            onSubmit={doGrant}
            onReset={resetGrantForm}
          />
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
