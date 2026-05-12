"use client"

import { AnimatePresence } from 'framer-motion'
import { Loader } from '@/shared/components'
import ConfirmDialog from '@/shared/components/custom/ConfirmDialog'
import BulkAssignChallengesCard from './BulkAssignChallengesCard'
import EventFormDialog from './EventFormDialog'
import EventListCard from './EventListCard'
import EventMembersCard from './EventMembersCard'
import JoinRequestsCard from './JoinRequestsCard'
import { useAdminEventData } from '../hooks/useAdminEventData'
import { AdminPageShell } from '../../ui'

export default function AdminEventPage() {
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
    <>
      <AdminPageShell mainClassName="py-6 space-y-6" backButtonClassName="">
        <EventListCard
          events={sortedEvents}
          onAdd={openAdd}
          onEdit={openEdit}
          onDelete={askDelete}
        />

        <EventMembersCard
          events={sortedEvents}
          manageEventId={manageEventId}
          onManageEventChange={setManageEventId}
          assignUserQuery={assignUserQuery}
          onAssignUserQueryChange={setAssignUserQuery}
          loadingUserSearch={loadingUserSearch}
          candidateUsers={candidateUsers}
          selectedCandidateUserIds={selectedCandidateUserIds}
          onToggleCandidateSelection={toggleCandidateSelection}
          onSelectAllCandidates={selectAllCandidates}
          onClearCandidateSelection={clearCandidateSelection}
          onQuickAddSelectedMembers={handleQuickAddSelectedMembers}
          memberActionUserId={memberActionUserId}
          onQuickAddMember={handleQuickAddMember}
          memberQuery={memberQuery}
          onMemberQueryChange={setMemberQuery}
          loadingEventMembers={loadingEventMembers}
          filteredEventMembers={filteredEventMembers}
          onRemoveMember={handleRemoveMember}
        />

        <BulkAssignChallengesCard
          events={sortedEvents}
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          difficulties={difficulties}
          onSelectAllFiltered={selectAllFiltered}
          onClearSelection={clearSelection}
          bulkEventId={bulkEventId}
          onBulkEventChange={setBulkEventId}
          onBulkAssign={handleBulkAssign}
          onBulkRemove={handleBulkRemove}
          bulkSubmitting={bulkSubmitting}
          filteredChallenges={filteredChallenges}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />

        <JoinRequestsCard
          events={sortedEvents}
          manageEventId={manageEventId}
          onManageEventChange={setManageEventId}
          joinRequests={joinRequests}
          loadingJoinRequests={loadingJoinRequests}
          reviewingRequestId={reviewingRequestId}
          onReviewRequest={handleReviewRequest}
        />
      </AdminPageShell>

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
    </>
  )
}
