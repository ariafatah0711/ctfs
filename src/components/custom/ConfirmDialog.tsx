"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm",
  description = "Are you sure?",
  onConfirm,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-700 dark:text-gray-200">
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
