"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

import { ReactNode } from "react"
type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: ReactNode
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm",
  description = "Are you sure?",
  onConfirm,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  confirmDisabled = false,
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
      <DialogContent className="bg-white dark:bg-gray-900 [&_button.absolute]:scale-125 [&_button.absolute]:text-red-500 [&_button.absolute]:hover:text-red-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 dark:text-gray-300">{description}</div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-700 dark:text-gray-200">
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={loading || confirmDisabled}>
            {loading ? "..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
