'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges, submitFlag } from '@/lib/challenges'
import { ChallengeWithSolve, User, Attachment } from '@/types'
import Navbar from '@/components/Navbar'

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
    setExpandedChallenges(prev => ({
      ...prev,
      [challengeId]: !prev[challengeId]
    }))
  }

  const showHint = (challenge: ChallengeWithSolve) => {
    setShowHintModal({ challenge })
  }

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-gray-300">Selamat datang, {user.username}!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">🏆</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">Total Score</dt>
                      <dd className="text-lg font-medium text-white">{user.score}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">Challenges Solved</dt>
                      <dd className="text-lg font-medium text-white">{solvedCount}/{challenges.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">Progress</dt>
                      <dd className="text-lg font-medium text-white">
                        {challenges.length > 0 ? Math.round((solvedCount / challenges.length) * 100) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Challenges */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Challenges</h2>
            
            {challenges.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">Belum ada challenges tersedia</div>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(
                  challenges.reduce((acc, challenge) => {
                    if (!acc[challenge.category]) {
                      acc[challenge.category] = []
                    }
                    acc[challenge.category].push(challenge)
                    return acc
                  }, {} as {[key: string]: ChallengeWithSolve[]})
                ).map(([category, categoryChallenges]) => (
                  <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-gray-800 px-6 py-4">
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        &gt;&gt; {category}
                      </h3>
                    </div>
                    
                    {/* Challenges List */}
                    <div className="divide-y divide-gray-200">
                      {categoryChallenges.map((challenge) => (
                        <div key={challenge.id}>
                          {/* Challenge Header - Compact */}
                          <div 
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => toggleChallengeExpansion(challenge.id)}
                          >
                            <div className="flex items-center justify-between">
                              {/* Challenge Info */}
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Status Indicator */}
                                <div className={`w-3 h-3 rounded-full ${
                                  challenge.is_solved ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                
                                {/* Challenge Name & Details */}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {challenge.title}
                                      {challenge.is_solved && (
                                        <span className="ml-2 text-green-600">✓</span>
                                      )}
                                    </h4>
                                    
                                    <span className="flex items-center text-sm text-gray-600">
                                      <span className="mr-1">🪙</span>
                                      {challenge.points} points
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
                              
                              {/* Flag Input */}
                              {!challenge.is_solved && (
                                <div className="ml-6 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={flagInputs[challenge.id] || ''}
                                    onChange={(e) => handleFlagInputChange(challenge.id, e.target.value)}
                                    placeholder="Enter flag..."
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleFlagSubmit(challenge.id)}
                                  />
                                  <button
                                    onClick={() => handleFlagSubmit(challenge.id)}
                                    disabled={submitting[challenge.id] || !flagInputs[challenge.id]?.trim()}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {submitting[challenge.id] ? '...' : 'Submit'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          {expandedChallenges[challenge.id] && (
                            <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                              <div className="pt-4">
                                {/* Description */}
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Description:</h5>
                                  <p className="text-sm text-gray-600">
                                    {challenge.description}
                                  </p>
                                </div>
                                
                                {/* Attachments */}
                                {challenge.attachments && challenge.attachments.length > 0 && (
                                  <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Files & Links:</h5>
                                    <div className="space-y-2">
                                      {challenge.attachments.map((attachment, index) => {
                                        const attachmentKey = `${challenge.id}-${index}`
                                        const isDownloading = downloading[attachmentKey]
                                        
                                        return (
                                          <div key={index} className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">
                                              {attachment.type === 'file' ? '📁' : '🔗'} {attachment.name}
                                            </span>
                                            <button
                                              onClick={() => downloadFile(attachment, attachmentKey)}
                                              disabled={isDownloading}
                                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                            >
                                              {isDownloading ? (
                                                <>
                                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-green-700"></div>
                                                  <span>Downloading...</span>
                                                </>
                                              ) : (
                                                <span>{attachment.type === 'file' ? 'Download' : 'Open'}</span>
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
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => showHint(challenge)}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                                    >
                                      💡 Show Hint
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
