"use client"

import React from "react"

import { customComponents, Loader } from '@/shared/components'
import { SolversListCard } from '../_components'
import { useAdminSolversData } from '../_hooks'

export default function AdminSolversPage() {
  const { BackButton, ConfirmDialog } = customComponents
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/admin" label="Go Back" />
        </div>

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
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Solver"
        description={
          <div>
            <div className="mb-2">Are you sure you want to delete this solver record? This action cannot be undone.</div>
            {pendingDeleteDetail && (
              <div className="mt-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold flex flex-col gap-1">
                <span>👤 <b>User:</b> <span className="font-mono max-w-[300px] truncate inline-flex">{pendingDeleteDetail.username}</span></span>
                <span>🏆 <b>Challenge:</b> <span className="font-mono max-w-[300px] truncate inline-flex">{pendingDeleteDetail.challenge_title}</span></span>
              </div>
            )}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (pendingDelete) {
            await doDelete(pendingDelete)
            setPendingDelete(null)
            setPendingDeleteDetail(null)
            setConfirmOpen(false)
          }
        }}
      />
    </div>
  )
}
