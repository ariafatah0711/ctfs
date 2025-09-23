'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges, submitFlag } from '@/lib/challenges'
import { ChallengeWithSolve, User, Attachment } from '@/types'
import Navbar from '@/components/Navbar'
import ChallengeStatsFilterBar from '@/components/ChallengeStatsFilterBar'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function ChallengesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [loading, setLoading] = useState(true)
  const [flagInputs, setFlagInputs] = useState<{[key: string]: string}>({})
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({})
  const [expandedChallenges, setExpandedChallenges] = useState<{[key: string]: boolean}>({})
  const [showHintModal, setShowHintModal] = useState<{challenge: ChallengeWithSolve | null}>({challenge: null})
  const [downloading, setDownloading] = useState<{[key: string]: boolean}>({})

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'solved', 'unsolved'
    category: 'all', // 'all', 'Web', 'Reverse', 'Crypto', etc.
    difficulty: 'all', // 'all', 'Easy', 'Medium', 'Hard'
    search: '' // search by title/description
  })

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      const challengesData = await getChallenges(currentUser.id)
      console.log('Challenges data:', challengesData) // Debug log
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
        // Clear input
        setFlagInputs(prev => ({ ...prev, [challengeId]: '' }))

        // Refresh challenges and user data
      const challengesData = await getChallenges(user.id)
      setChallenges(challengesData)

      const updatedUser = await getCurrentUser()
      setUser(updatedUser)
    }

      alert(result.message)
    } catch (error) {
      console.error('Error submitting flag:', error)
      alert('Terjadi kesalahan saat submit flag')
    } finally {
      setSubmitting(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  const handleFlagInputChange = (challengeId: string, value: string) => {
    setFlagInputs(prev => ({ ...prev, [challengeId]: value }))
  }

  const toggleChallengeExpansion = (challengeId: string) => {
    setExpandedChallenges(prev => {
      const isCurrentlyOpen = prev[challengeId]

      if (isCurrentlyOpen) {
        // If clicking on currently open challenge, close it
        return { [challengeId]: false }
      } else {
        // If clicking on closed challenge, close all others and open this one
        return { [challengeId]: true }
      }
    })
  }

  const showHint = (challenge: ChallengeWithSolve) => {
    setShowHintModal({ challenge })
  }

  // Filter challenges based on current filters
  const filteredChallenges = challenges.filter(challenge => {
    // Status filter
    if (filters.status === 'solved' && !challenge.is_solved) return false
    if (filters.status === 'unsolved' && challenge.is_solved) return false

    // Category filter
    if (filters.category !== 'all' && challenge.category !== filters.category) return false

    // Difficulty filter
    if (filters.difficulty !== 'all' && challenge.difficulty !== filters.difficulty) return false

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const titleMatch = challenge.title.toLowerCase().includes(searchLower)
      const descMatch = challenge.description.toLowerCase().includes(searchLower)
      if (!titleMatch && !descMatch) return false
    }

    return true
  })

  // Get unique categories and difficulties for filter options
  const categories = Array.from(new Set(challenges.map(c => c.category))).sort()
  const difficulties = Array.from(new Set(challenges.map(c => c.difficulty))).sort()

  const downloadFile = async (attachment: Attachment, attachmentKey: string) => {
    setDownloading(prev => ({ ...prev, [attachmentKey]: true }))

    try {
    if (attachment.type === 'file') {
        // For files, try to download directly
        const response = await fetch(attachment.url)
        if (!response.ok) {
          throw new Error('Failed to fetch file')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Create temporary download link
        const link = document.createElement('a')
        link.href = url
        link.download = attachment.name
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    } else {
      // For links, open in new tab
        window.open(attachment.url, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback to opening in new tab if download fails
      window.open(attachment.url, '_blank')
    } finally {
      setDownloading(prev => ({ ...prev, [attachmentKey]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading challenges...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const solvedCount = challenges.filter(c => c.is_solved).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Title */}
      <h1 className="text-3xl font-bold text-center">
        🚩 challanges
      </h1>

        <ChallengeStatsFilterBar
          filters={filters}
          categories={categories}
          difficulties={difficulties}
          onFilterChange={setFilters}
          onClear={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '' })}
        />

        {/* Challenges Section */}
          <div>
            {filteredChallenges.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {challenges.length === 0
                  ? "No challenges available"
                  : "No challenges match your filters"
                }
              </h3>
              <p className="text-gray-500">
                {challenges.length === 0
                  ? "Check back later for new challenges"
                  : "Try adjusting your filter criteria"
                }
              </p>
              </div>
            ) : (
            <div className="space-y-2">
                {Object.entries(
                  filteredChallenges.reduce((acc, challenge) => {
                    if (!acc[challenge.category]) {
                      acc[challenge.category] = []
                    }
                    acc[challenge.category].push(challenge)
                    return acc
                  }, {} as {[key: string]: ChallengeWithSolve[]})
                ).map(([category, categoryChallenges]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {/* Category Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">
                        {category}
                      </h3>
                      <div className="text-xs text-blue-100">
                        {categoryChallenges.filter(c => c.is_solved).length} / {categoryChallenges.length} solved
                      </div>
                    </div>
                    <div className="w-full bg-blue-800 rounded-full h-0.5 mt-1">
                      <div
                        className="bg-blue-200 h-0.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${categoryChallenges.length > 0
                            ? (categoryChallenges.filter(c => c.is_solved).length / categoryChallenges.length) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                    </div>

                    {/* Challenges List */}
                    <div className="divide-y divide-gray-200">
                      {categoryChallenges.map((challenge) => (
                        <div key={challenge.id}
                          className={`transition-all duration-200 ${
                            challenge.is_solved
                              ? 'bg-green-100 border-l-4 hover:bg-green-200'
                              : 'bg-white hover:bg-gray-50 border-l-4'
                          }`}
                        >
                        {/* Challenge Header */}
                        <div
                          className="p-1.5 cursor-pointer"
                          onClick={() => toggleChallengeExpansion(challenge.id)}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                              {/* Challenge Info */}
                              <div className="flex items-center space-x-3 flex-1">
                                {/* Status Indicator */}
                                <div className={`w-2 h-2 rounded-full ${
                                  challenge.is_solved ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>

                              {/* Challenge Details */}
                                <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                  <h4 className="text-base font-semibold text-gray-900">
                                      {challenge.title}
                                      {challenge.is_solved && (
                                      <span className="ml-2 text-green-600 text-xs">✓</span>
                                      )}
                                    </h4>

                                  <div className="flex items-center space-x-1.5">
                                    <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                      <span className="mr-1">🪙</span>
                                      {challenge.points}
                                    </span>

                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                      challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {challenge.difficulty}
                                    </span>
                                  </div>
                                  </div>
                                </div>

                                {/* Expand/Collapse Icon */}
                                <div className="flex-shrink-0">
                                  <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                      expandedChallenges[challenge.id] ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {/* Flag Input */}
                              {!challenge.is_solved && (
                              <div className="lg:ml-4 flex items-center space-x-2 hidden lg:flex" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={flagInputs[challenge.id] || ''}
                                    onChange={(e) => handleFlagInputChange(challenge.id, e.target.value)}
                                  placeholder="Enter flag..."
                                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-60"
                                    onKeyPress={(e) => e.key === 'Enter' && handleFlagSubmit(challenge.id)}
                                  />
                                  <button
                                    onClick={() => handleFlagSubmit(challenge.id)}
                                    disabled={submitting[challenge.id] || !flagInputs[challenge.id]?.trim()}
                                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                  {submitting[challenge.id] ? 'Submitting...' : 'Submit'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        {/* Expanded Details */}
                        {expandedChallenges[challenge.id] && (
                          <div className="px-3 pb-3 border-t bg-gray-50 border-gray-200">
                            <div className="pt-2">
                              {/* Mobile Flag Input */}
                              {!challenge.is_solved && (
                                <div className="mb-1 lg:hidden">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={flagInputs[challenge.id] || ''}
                                      onChange={(e) => handleFlagInputChange(challenge.id, e.target.value)}
                                      placeholder="Enter flag..."
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      onKeyPress={(e) => e.key === 'Enter' && handleFlagSubmit(challenge.id)}
                                    />
                                    <button
                                      onClick={() => handleFlagSubmit(challenge.id)}
                                      disabled={submitting[challenge.id] || !flagInputs[challenge.id]?.trim()}
                                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {submitting[challenge.id] ? '...' : 'Submit'}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Description */}
                              <div className="mb-2">
                                <h5 className="text-sm font-semibold text-gray-900 mb-1">Description</h5>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                  <MarkdownRenderer content={challenge.description} />
                                  </div>
                                </div>

                                {/* Attachments */}
                                {challenge.attachments && challenge.attachments.length > 0 && (
                                <div className="mb-2">
                                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Files & Links</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {challenge.attachments.map((attachment, index) => {
                                        const attachmentKey = `${challenge.id}-${index}`
                                        const isDownloading = downloading[attachmentKey]

                                        return (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-lg">
                                              {attachment.type === 'file' ? '📁' : '🔗'}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                              {attachment.name}
                                          </span>
                                          </div>
                                          <button
                                              onClick={() => downloadFile(attachment, attachmentKey)}
                                              disabled={isDownloading}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                            >
                                              {isDownloading ? (
                                                <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-700"></div>
                                                <span>Downloading...</span>
                                                </>
                                              ) : (
                                              <>
                                                <span>{attachment.type === 'file' ? '↓' : '→'}</span>
                                                <span>{attachment.type === 'file' ? 'Download' : 'Open'}</span>
                                              </>
                                              )}
                                          </button>
                                        </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Hint Button */}
                                {challenge.hint && (
                                <div className="flex items-center mt-1">
                                    <button
                                      onClick={() => showHint(challenge)}
                                    className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md hover:bg-yellow-200 transition-colors flex items-center space-x-1"
                                    >
                                    <span>💡</span>
                                    <span>Show Hint</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Hint Modal */}
      {showHintModal.challenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600 text-lg">💡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Hint for: {showHintModal.challenge.title}
              </h3>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                  {showHintModal.challenge.hint}
                </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowHintModal({ challenge: null })}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
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
