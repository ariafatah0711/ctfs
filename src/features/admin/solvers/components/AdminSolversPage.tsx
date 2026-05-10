"use client"

import { Loader } from '@/shared/components'
import DeleteSolverConfirmDialog from './DeleteSolverConfirmDialog'
import SolversListCard from './SolversListCard'
import { useAdminSolversData } from '../hooks/useAdminSolversData'
import { AdminPageShell } from '../../shared'

export default function AdminSolversPage() {
  const {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    solvers,
    offset,
    hasMore,
    loadingMore,
    searchQuery,
    setSearchQuery,
    searching,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    setPendingDelete,
    pendingDeleteDetail,
    setPendingDeleteDetail,
    fetchSolvers,
    searchSolvers,
    resetSearch,
    askDelete,
    doDelete,
  } = useAdminSolversData()

  if (authLoading || isLoading) return <Loader fullscreen color="text-orange-500" />
  if (!user || !isAdminUser) return null

  const clearPendingDelete = () => {
    setPendingDelete(null)
    setPendingDeleteDetail(null)
  }

  return (
    <>
      <AdminPageShell>
        <SolversListCard
          solvers={solvers}
          searchQuery={searchQuery}
          searching={searching}
          loadingMore={loadingMore}
          hasMore={hasMore}
          offset={offset}
          onSearchQueryChange={setSearchQuery}
          onSearch={() => void searchSolvers()}
          onReset={() => void resetSearch()}
          onAskDelete={askDelete}
          onLoadMore={fetchSolvers}
        />
      </AdminPageShell>

      <DeleteSolverConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pendingDelete={pendingDelete}
        pendingDeleteDetail={pendingDeleteDetail}
        onConfirmDelete={doDelete}
        onClearPendingDelete={clearPendingDelete}
      />
    </>
  )
}
