'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges, submitFlag } from '@/lib/challenges'
import { ChallengeWithSolve, User, Attachment } from '@/types'
import Navbar from '@/components/Navbar'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function DashboardPage() {
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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const solvedCount = challenges.filter(c => c.is_solved).length
  const totalPoints = challenges.filter(c => c.is_solved).reduce((sum, c) => sum + c.points, 0)

  return (
    <div className="min-h-screen bg-gray-900" style={{
      backgroundImage: `
        linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%),
        linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)
      `,
      backgroundSize: '20px 20px'
    }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>

          {/* Compact Stats */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">🏆</span>
                  <span className="text-white font-medium">{user.score}</span>
                  <span className="text-gray-400">points</span>
                    </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">✓</span>
                  <span className="text-white font-medium">{solvedCount}/{challenges.length}</span>
                  <span className="text-gray-400">solved</span>
                </div>
              </div>
              <div className="text-gray-400">
                {challenges.length > 0 ? Math.round((solvedCount / challenges.length) * 100) : 0}% complete
              </div>
            </div>
                    </div>


          {/* Ultra Compact Filter Section */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">
                {filteredChallenges.length}/{challenges.length} challenges
              </div>
              <button
                onClick={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '' })}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search..."
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 w-24"
              />

              {/* Status */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All</option>
                <option value="unsolved">Unsolved</option>
                <option value="solved">Solved</option>
              </select>

              {/* Category */}
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Cat</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Difficulty */}
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Diff</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              {/* Quick Filters */}
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'unsolved' }))}
                  className={`px-1 py-1 text-xs rounded transition-colors ${
                    filters.status === 'unsolved' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🔓
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'solved' }))}
                  className={`px-1 py-1 text-xs rounded transition-colors ${
                    filters.status === 'solved' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ✅
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, difficulty: 'Easy' }))}
                  className={`px-1 py-1 text-xs rounded transition-colors ${
                    filters.difficulty === 'Easy' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🟢
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, difficulty: 'Medium' }))}
                  className={`px-1 py-1 text-xs rounded transition-colors ${
                    filters.difficulty === 'Medium' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🟡
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, difficulty: 'Hard' }))}
                  className={`px-1 py-1 text-xs rounded transition-colors ${
                    filters.difficulty === 'Hard' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🔴
                </button>
              </div>
            </div>
          </div>

          {/* Challenges */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Challenges</h2>
            
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">
                  {challenges.length === 0 
                    ? "Belum ada challenges tersedia" 
                    : "Tidak ada challenges yang sesuai dengan filter"
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  filteredChallenges.reduce((acc, challenge) => {
                    if (!acc[challenge.category]) {
                      acc[challenge.category] = []
                    }
                    acc[challenge.category].push(challenge)
                    return acc
                  }, {} as {[key: string]: ChallengeWithSolve[]})
                ).map(([category, categoryChallenges]) => (
                  <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-gray-800 px-4 py-2">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                        &gt;&gt; {category}
                      </h3>
                    </div>
                    
                    {/* Challenges List */}
                    <div className="divide-y divide-gray-200">
                      {categoryChallenges.map((challenge) => (
                        <div key={challenge.id}>
                          {/* Challenge Header - Ultra Compact */}
                          <div 
                            className={`p-3 transition-colors cursor-pointer ${
                              challenge.is_solved 
                                ? 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => toggleChallengeExpansion(challenge.id)}
                          >
                            <div className="flex items-center justify-between">
                              {/* Challenge Info */}
                              <div className="flex items-center space-x-3 flex-1">
                                {/* Status Indicator */}
                                <div className={`w-2 h-2 rounded-full ${
                                  challenge.is_solved ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                
                                {/* Challenge Name & Details */}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {challenge.title}
                                      {challenge.is_solved && (
                                        <span className="ml-1 text-green-600">✓</span>
                                      )}
                                    </h4>
                                    
                                    <span className="flex items-center text-xs text-gray-600">
                                      <span className="mr-1">🪙</span>
                                      {challenge.points}
                                    </span>
                                    
                                    <span className={`px-1 py-0.5 text-xs font-medium rounded ${
                                      challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                      challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {challenge.difficulty}
                                    </span>
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
                                <div className="ml-4 flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={flagInputs[challenge.id] || ''}
                                    onChange={(e) => handleFlagInputChange(challenge.id, e.target.value)}
                                    placeholder="flag..."
                                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent w-20"
                                    onKeyPress={(e) => e.key === 'Enter' && handleFlagSubmit(challenge.id)}
                                  />
                                  <button
                                    onClick={() => handleFlagSubmit(challenge.id)}
                                    disabled={submitting[challenge.id] || !flagInputs[challenge.id]?.trim()}
                                    className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {submitting[challenge.id] ? '...' : '✓'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          {expandedChallenges[challenge.id] && (
                            <div className={`px-3 pb-3 border-t ${
                              challenge.is_solved 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="pt-2">
                                {/* Description */}
                                <div className="mb-3">
                                  <h5 className="text-xs font-medium text-gray-700 mb-1">Description:</h5>
                                  <div className="text-xs text-gray-600">
                                    <MarkdownRenderer content={challenge.description} />
                                  </div>
                                </div>
                                
                                {/* Attachments */}
                                {challenge.attachments && challenge.attachments.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="text-xs font-medium text-gray-700 mb-1">Files & Links:</h5>
                                    <div className="space-y-1">
                                      {challenge.attachments.map((attachment, index) => {
                                        const attachmentKey = `${challenge.id}-${index}`
                                        const isDownloading = downloading[attachmentKey]
                                        
                                        return (
                                          <div key={index} className="flex items-center space-x-1">
                                            <span className="text-xs text-gray-600">
                                            {attachment.type === 'file' ? '📁' : '🔗'} {attachment.name}
                                          </span>
                                          <button
                                              onClick={() => downloadFile(attachment, attachmentKey)}
                                              disabled={isDownloading}
                                              className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                            >
                                              {isDownloading ? (
                                                <>
                                                  <div className="animate-spin rounded-full h-2 w-2 border-b border-green-700"></div>
                                                  <span>...</span>
                                                </>
                                              ) : (
                                                <span>{attachment.type === 'file' ? '↓' : '→'}</span>
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
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => showHint(challenge)}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                                    >
                                      💡 Hint
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
      </div>

      {/* Hint Modal */}
      {showHintModal.challenge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Hint untuk: {showHintModal.challenge.title}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  {showHintModal.challenge.hint}
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowHintModal({ challenge: null })}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
