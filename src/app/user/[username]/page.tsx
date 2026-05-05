'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUserByUsername } from '@/shared/lib/users'
import { useAuth } from '@/shared/contexts'
import { UserProfile } from '@/shared/components/user'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔧 Fix trailing ? di URL
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.search === '?' &&
      window.location.hash === ''
    ) {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [])

  // 🔐 Redirect kalau belum login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // 🔄 Fetch userId dari username
  useEffect(() => {
    if (!user) return

    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const username = decodeURIComponent(params.username as string)

      try {
        const userData = await getUserByUsername(username)

        if (cancelled) return

        if (!userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        // 🔥 kalau buka profile sendiri → redirect biar konsisten
        if (userData.id === user.id) {
          router.replace('/profile')
          return
        }

        setUserId(userData.id)
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching user:', err)
        setError('Failed to load user profile')
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [user, params.username, router])

  // ⏳ Tunggu auth (JANGAN fullscreen biar gak flash)
  if (authLoading) {
    return null
  }

  // ⛔ Jangan render kalau belum login (redirect jalan dulu)
  if (!user) return null

  // ❌ Error UI (ini boleh beda)
  if (error) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Oops!</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <button
            onClick={() => router.push('/challenges')}
            className="mt-6 px-6 py-2 rounded-lg bg-primary-600 dark:bg-primary-700 text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    )
  }

  // ✅ SELALU render UserProfile (kunci anti flicker)
  return (
    <UserProfile
      userId={userId}
      loading={loading}
      error={error}
      onBack={() => router.back()}
      isCurrentUser={userId === user?.id}
    />
  )
}
