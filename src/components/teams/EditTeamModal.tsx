'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DIALOG_CONTENT_CLASS } from '@/styles/dialog'

interface EditTeamModalProps {
  currentName: string
  onSave: (newName: string) => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
}

export default function EditTeamModal({
  currentName,
  onSave,
  disabled,
}: EditTeamModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (val) {
      setName(currentName)
      setError(null)
    }
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) {
      setOpen(false)
      return
    }

    setLoading(true)
    setError(null)

    const res = await onSave(trimmed)
    setLoading(false)

    if (res.success) {
      setOpen(false)
    } else {
      setError(res.error || 'Failed to update team name')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger */}
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="gap-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold border-none"
      >
        <Pencil size={14} />
        Edit Team
      </Button>

      {/* Modal */}
      <DialogContent
        className={
          DIALOG_CONTENT_CLASS +
          ' [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden'
        }
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Edit Team
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-300">
            Update your team information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Team Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Team Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              maxLength={50}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Max 50 characters. Must be unique.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm text-center font-semibold">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              !name.trim() ||
              name.trim() === currentName
            }
            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
