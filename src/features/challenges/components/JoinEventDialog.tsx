"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { DIALOG_CONTENT_CLASS } from "@/shared/styles"
import { Event } from "@/shared/types"
import toast from "react-hot-toast"
import { joinEvent } from "@/shared/lib"

type JoinEventDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  joinMode: 'open' | 'key' | 'request'
  membershipData: any
  onSuccess: () => void
}

export default function JoinEventDialog({
  open,
  onOpenChange,
  event,
  joinMode,
  membershipData,
  onSuccess,
}: JoinEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [joinKey, setJoinKey] = useState("")
  const [joinNote, setJoinNote] = useState("")

  const handleJoin = async () => {
    if (!event) return

    if (joinMode === 'key' && !joinKey.trim()) {
      toast.error('Join key is required')
      return
    }

    setLoading(true)
    try {
      const result = await joinEvent(
        event.id,
        joinMode === 'key' ? joinKey.trim() : null,
        joinMode === 'request' ? joinNote.trim() : null
      )
      if (result?.success) {
        toast.success(result.message || 'Join request submitted')
        onSuccess()
      } else {
        toast.error(result?.message || 'Failed to join event')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to join event')
    } finally {
      setLoading(false)
    }
  }

  const isPending = membershipData?.request_status === 'pending'
  const isRejected = membershipData?.request_status === 'rejected'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONTENT_CLASS + " max-w-md [&_button.absolute]:scale-125 [&_button.absolute]:text-red-500 [&_button.absolute]:hover:text-red-700"}>
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Join Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Event: {event?.name || 'Unknown Event'}
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Kamu perlu join event ini terlebih dahulu untuk mengakses challenge.
            </p>
          </div>

          {joinMode === 'key' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Key
              </label>
              <input
                type="text"
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                placeholder="Masukkan key event"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>
          )}

          {joinMode === 'request' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catatan Request (opsional)
              </label>
              <textarea
                value={joinNote}
                onChange={(e) => setJoinNote(e.target.value)}
                placeholder="Tulis alasan singkat join event"
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>
          )}

          {isPending ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm rounded border border-amber-200 dark:border-amber-800">
              Request kamu masih pending approval admin.
            </div>
          ) : isRejected ? (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded border border-red-200 dark:border-red-800">
              Request sebelumnya ditolak. Kamu bisa kirim ulang.
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-700 dark:text-gray-200">
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={loading || isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "..." : joinMode === 'request' ? 'Kirim Request' : joinMode === 'key' ? 'Join' : 'Join Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
