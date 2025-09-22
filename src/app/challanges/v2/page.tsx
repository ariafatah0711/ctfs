'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges, submitFlag } from '@/lib/challenges'
import { ChallengeWithSolve, User, Attachment } from '@/types'
import Navbar from '@/components/Navbar'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function ChallengesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [loading, setLoading] = useState(true)
  const [flagInputs, setFlagInputs] = useState<{ [key: string]: string }>({})
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({})
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolve | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const challengesData = await getChallenges(currentUser.id)
      setChallenges(challengesData)
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleFlagSubmit = async (challengeId: string) => {
    if (!user || !flagInputs[challengeId]?.trim()) return

    setSubmitting(prev => ({ ...prev, [challengeId]: true }))
    try {
      const result = await submitFlag(challengeId, flagInputs[challengeId].trim(), user.id)
      if (result.success) {
        setFlagInputs(prev => ({ ...prev, [challengeId]: '' }))
        const challengesData = await getChallenges(user.id)
        setChallenges(challengesData)
        const updatedUser = await getCurrentUser()
        setUser(updatedUser)
      }
      alert(result.message)
    } finally {
      setSubmitting(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  if (loading) {
    return <div className="text-center p-10">Loading...</div>
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">🚩 Challenges</h1>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(challenge => (
            <div
              key={challenge.id}
              className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer ${
                challenge.is_solved ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
              onClick={() => setSelectedChallenge(challenge)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                {challenge.is_solved && <span className="text-green-600 text-sm font-medium">✓</span>}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="bg-gray-100 px-2 py-0.5 rounded">🪙 {challenge.points}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    challenge.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-700'
                      : challenge.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{selectedChallenge.title}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {selectedChallenge.points} points • {selectedChallenge.difficulty}
              </p>

              <div className="mb-4">
                <MarkdownRenderer content={selectedChallenge.description} />
              </div>

              {selectedChallenge.attachments?.length && selectedChallenge.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Files & Links</h4>
                  <ul className="space-y-2">
                    {selectedChallenge.attachments.map((a, i) => (
                      <li key={i}>
                        <a
                          href={a.url}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          {a.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!selectedChallenge.is_solved && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={flagInputs[selectedChallenge.id] || ''}
                    onChange={(e) =>
                      setFlagInputs(prev => ({ ...prev, [selectedChallenge.id]: e.target.value }))
                    }
                    placeholder="Enter flag..."
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={() => handleFlagSubmit(selectedChallenge.id)}
                    disabled={submitting[selectedChallenge.id]}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {submitting[selectedChallenge.id] ? '...' : 'Submit'}
                  </button>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
