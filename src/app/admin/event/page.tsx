"use client"

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { Loader, customComponents } from '@/shared/components'
import { EventFormDialog, EventListCard } from '../_components'
import { useAdminEventData } from '../_hooks'
import { ChallengeFilterBar } from '@/shared/components/challenges'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/ui'

export default function AdminEventPage() {
  const { BackButton, ConfirmDialog } = customComponents
  const {
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
  } = useAdminEventData()

  if (authLoading || isLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user || !isAdminUser) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <BackButton href="/admin" label="Go Back" />

        <EventListCard
          events={sortedEvents}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={askDelete}
        />

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
                onClear={() => setFilters({ category: 'all', difficulty: 'all', search: '', feature: 'N' })}
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
          <EventFormDialog
            open={openForm}
            editing={editing}
            formData={formData}
            submitting={submitting}
            onOpenChange={setOpenForm}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onRegenerateJoinKey={handleRegenerateJoinKey}
          />
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
