'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendPasswordReset } from '@/lib/auth'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { error } = await sendPasswordReset(email)
      if (error) {
        setError(error)
      } else {
        setSuccess('Password reset email sent! Please check your inbox.')
      }
    } catch {
      setError('Failed to send reset email')
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
          Forgot Password
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:text-gray-100 sm:text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            {loading ? 'Processing...' : 'Send Reset Email'}
          </button>
  </form>
  <div className="mt-4 text-center">
          <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
            Back to Login
          </Link>
        </div>
  </motion.div>
  </div>
  )
}
