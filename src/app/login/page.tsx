'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import Loader from '@/components/custom/loading'
import GoogleLoginButton from '@/components/GoogleLoginButton'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // if user already logged in → redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/challenges')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { user, error } = await signIn(formData.identifier, formData.password)

      if (error) {
        setError(error)
      } else if (user) {
        setUser(user) // simpan user ke context
        router.push('/challenges')
      }
    } catch {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // show loader while checking auth session
  if (authLoading) {
    return <Loader fullscreen color="text-orange-500" />
  }

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8"
      >
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to CTFS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
          >
            create a new account
          </Link>
        </p>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              placeholder="Username or Email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:text-sm"
              value={formData.identifier}
              onChange={handleChange}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>

          {/* Tombol Google Sign-In */}
          <GoogleLoginButton />
        </form>
      </motion.div>
  </div>
  )
}
