"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { DIALOG_CONTENT_CLASS } from "@/shared/styles"
import { Event } from "@/shared/types"
import { joinEvent } from "@/features/events/services/event.service"
import toast from "react-hot-toast"

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
      <DialogContent className="max-w-md rounded-2xl bg-white/60 dark:bg-[#111622]/60 border border-gray-200 dark:border-gray-800 backdrop-blur-xl p-6 shadow-2xl [&_button.absolute.right-4.top-4]:text-gray-500 dark:[&_button.absolute.right-4.top-4]:text-gray-400">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Join Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 my-4">
          <div className="p-4 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {event?.name || 'Unknown Event'}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              You need to join this event to access its challenges. Follow the requirements below to proceed.
            </p>
          </div>

          {joinMode === 'key' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Event Access Key
              </label>
              <input
                type="text"
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                placeholder="Enter access key..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                autoFocus
              />
            </div>
          )}

          {joinMode === 'request' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Join Request Note
              </label>
              <textarea
                value={joinNote}
                onChange={(e) => setJoinNote(e.target.value)}
                placeholder="Tell us why you'd like to join..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                autoFocus
              />
            </div>
          )}

          {isPending ? (
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center">
              Your request is currently pending admin approval.
            </div>
          ) : isRejected ? (
            <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center justify-center">
              Your previous request was declined. You can try again.
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={loading || isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            {loading ? "Processing..." : joinMode === 'request' ? 'Submit Request' : joinMode === 'key' ? 'Verify & Join' : 'Join Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
