'use client'

import { useState } from 'react'
import { ChallengeWithSolve } from '@/types'
import { submitFlag } from '@/lib/challenges'
import { getCurrentUser } from '@/lib/auth'

interface ChallengeCardProps {
  challenge: ChallengeWithSolve
  onSolve: () => void
}

export default function ChallengeCard({ challenge, onSolve }: ChallengeCardProps) {
  const [flag, setFlag] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flag.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const user = await getCurrentUser()
      if (!user) {
        setMessage('Anda harus login terlebih dahulu')
        setMessageType('error')
        return
      }

      const result = await submitFlag(challenge.id, flag.trim())

      if (result.success) {
        setMessage(result.message)
        setMessageType('success')
        setFlag('')
        onSolve() // Refresh challenges
      } else {
        setMessage(result.message)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat submit flag')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Web': 'bg-blue-100 text-blue-800',
      'Reverse': 'bg-purple-100 text-purple-800',
      'Crypto': 'bg-yellow-100 text-yellow-800',
      'Pwn': 'bg-red-100 text-red-800',
      'Forensics': 'bg-green-100 text-green-800',
      'Misc': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

          {/* Tags */}
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(challenge.category)}`}>
              {challenge.category}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            <span className="text-sm text-gray-600 font-medium">{challenge.points} pts</span>
          </div>

          {/* Hint */}
          {challenge.hint && !challenge.is_solved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">💡</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Hint:</p>
                  <p className="text-sm text-yellow-700">{challenge.hint}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {challenge.is_solved && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-4">
            ✓ Solved
          </span>
        )}
      </div>

      {!challenge.is_solved && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="Masukkan flag..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !flag.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Flag'}
          </button>
        </form>
      )}
    </div>
  )
}
