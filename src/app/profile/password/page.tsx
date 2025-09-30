'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { updatePassword } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loader from '@/components/custom/loading'

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Anda perlu login terlebih dahulu
          </h2>
          <a
            href="/login"
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            Login
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) {
        setError(error)
      } else {
        setSuccess('Password updated successfully!')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setError('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8"
      >
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Change Password
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="password"
            name="newPassword"
            required
            placeholder="New password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:text-gray-100 sm:text-sm"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirm new password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:text-gray-100 sm:text-sm"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900 p-3 text-sm text-green-700 dark:text-green-300">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
  </div>
  )
}
