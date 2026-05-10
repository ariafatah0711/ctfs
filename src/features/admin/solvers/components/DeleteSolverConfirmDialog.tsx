import React from 'react'
import ConfirmDialog from '@/shared/components/custom/ConfirmDialog'
import type { PendingDeleteDetail } from '../types'

interface DeleteSolverConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingDelete: string | null
  pendingDeleteDetail: PendingDeleteDetail
  onConfirmDelete: (solverId: string) => Promise<void>
  onClearPendingDelete: () => void
}

const DeleteSolverConfirmDialog: React.FC<DeleteSolverConfirmDialogProps> = ({
  open,
  onOpenChange,
  pendingDelete,
  pendingDeleteDetail,
  onConfirmDelete,
  onClearPendingDelete,
}) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Solver"
      description={
        <div>
          <div className="mb-2">Are you sure you want to delete this solver record? This action cannot be undone.</div>
          {pendingDeleteDetail && (
            <div className="mt-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold flex flex-col gap-1">
              <span><b>User:</b> <span className="font-mono max-w-[300px] truncate inline-flex">{pendingDeleteDetail.username}</span></span>
              <span><b>Challenge:</b> <span className="font-mono max-w-[300px] truncate inline-flex">{pendingDeleteDetail.challenge_title}</span></span>
            </div>
          )}
        </div>
      }
      confirmLabel="Delete"
      onConfirm={async () => {
        if (!pendingDelete) return
        await onConfirmDelete(pendingDelete)
        onClearPendingDelete()
        onOpenChange(false)
      }}
    />
  )
}

export default DeleteSolverConfirmDialog
