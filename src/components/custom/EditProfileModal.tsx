"use client"

import { useState } from 'react'
import { updateUsername } from '@/lib/users'
import { isValidUsername } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EditProfileModal({
  userId,
  currentUsername,
  onUsernameChange,
  triggerButtonClass = '',
}: {
  userId: string
  currentUsername: string
  onUsernameChange?: (username: string) => void
  triggerButtonClass?: string
}) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    const usernameTrimmed = username.trim()
    const usernameError = isValidUsername(usernameTrimmed)
    if (usernameError) {
      setError(usernameError)
      setLoading(false)
      return
    }
  const { error, username: newUsername } = await updateUsername(userId, usernameTrimmed)
    if (error) {
      setError(error)
    } else {
      setSuccess('Username updated!')
      setUsername(newUsername || username)
      onUsernameChange?.(newUsername || username)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerButtonClass}>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white
">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-300">Update your username below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            disabled={loading}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
          {error && <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-600 dark:text-green-400 text-sm">{success}</div>}

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>

        <div className="text-center mt-2">
          <Link
            href="/profile/password"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            Change Password
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
