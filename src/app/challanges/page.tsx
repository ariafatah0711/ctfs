'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges, submitFlag, getSolversByChallenge } from '@/lib/challenges'
import { ChallengeWithSolve, User, Attachment } from '@/types'

type Solver = {
  username: string;
  solvedAt: string;
};
import Navbar from '@/components/Navbar'
import ChallengeStatsFilterBar from '@/components/ChallengeStatsFilterBar'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function ChallengesPage() {
  // State untuk tab modal challenge
  const [challengeTab, setChallengeTab] = useState<'challenge' | 'solvers'>('challenge');
  const [solvers, setSolvers] = useState<Solver[]>([]);
  // Saat tab solvers dibuka, fetch solvers
  const handleTabChange = async (tab: 'challenge' | 'solvers', challengeId: string) => {
    setChallengeTab(tab);
    if (tab === 'solvers') {
      try {
        const data = await getSolversByChallenge(challengeId);
        setSolvers(data);
      } catch (err) {
        setSolvers([]);
      }
    }
  };
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [loading, setLoading] = useState(true)
  const [flagInputs, setFlagInputs] = useState<{[key: string]: string}>({})
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({})
  const [expandedChallenges, setExpandedChallenges] = useState<{[key: string]: boolean}>({})
  const [showHintModal, setShowHintModal] = useState<{challenge: ChallengeWithSolve | null}>({challenge: null})
  const [downloading, setDownloading] = useState<{[key: string]: boolean}>({})
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolve | null>(null)

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

  // Tambahkan useEffect ini setelah deklarasi state
  useEffect(() => {
    if (selectedChallenge) {
      // Fetch solvers setiap kali challenge detail dibuka
      getSolversByChallenge(selectedChallenge.id)
        .then(setSolvers)
        .catch(() => setSolvers([]));
    }
  }, [selectedChallenge]);

  const handleFlagSubmit = async (challengeId: string) => {
    if (!user || !flagInputs[challengeId]?.trim()) return

    setSubmitting(prev => ({ ...prev, [challengeId]: true }))

    try {
      // Submit flag
      const result = await submitFlag(challengeId, flagInputs[challengeId].trim(), user.id)

      // Refresh challenges and user data (selalu, agar status is_solved up-to-date)
      const challengesData = await getChallenges(user.id)
      setChallenges(challengesData)
      const updatedUser = await getCurrentUser()
      setUser(updatedUser)

      // Tampilkan pesan dari backend langsung
      alert(result.message)
      if (result.success) {
        setFlagInputs(prev => ({ ...prev, [challengeId]: '' }))
      }
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
        const response = await fetch(attachment.url)
        if (!response.ok) throw new Error('Failed to fetch file')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = attachment.name || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        window.open(attachment.url, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
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

        {/* Challenges Grid Grouped by Category */}
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
            // Group by category
            Object.entries(
              filteredChallenges.reduce((acc, challenge) => {
                if (!acc[challenge.category]) acc[challenge.category] = []
                acc[challenge.category].push(challenge)
                return acc
              }, {} as {[key: string]: ChallengeWithSolve[]})
            ).map(([category, categoryChallenges]) => (
              <div key={category} className="mb-12">
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-orange-400 text-2xl">{'»'}</span>
                  <h2 className="text-xl sm:text-2xl tracking-widest text-gray-800 font-bold uppercase">{category}</h2>
                </div>
                {/* Grid Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`
                        relative rounded-md border-2
                        ${challenge.is_solved
                          ? 'bg-green-600 border-green-400 hover:border-green-200'
                          : 'bg-blue-700 border-blue-400 hover:border-blue-200'}
                        transition-all duration-150 cursor-pointer shadow-lg group
                      `}
                      onClick={() => setSelectedChallenge(challenge)}
                      style={{
                        minHeight: 110,
                        boxShadow: '0 2px 0 #222, 0 4px 24px #0004'
                      }}
                    >
                      {/* Centang kanan atas */}
                      {challenge.is_solved && (
                        <span className="absolute top-2 right-3 text-white text-lg font-bold select-none">
                          ✓
                        </span>
                      )}
                      <div className="flex flex-col items-center justify-center h-full py-6">
                        <span className="text-lg font-bold text-white mb-2 truncate">{challenge.title}</span>
                        <span className="flex items-center gap-1 text-yellow-300 text-base font-semibold">
                          <span className="text-lg">🪙</span> {challenge.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={() => {
            setSelectedChallenge(null);
            setChallengeTab('challenge');
          }}
        >
          <div
            className="relative w-full max-w-lg mx-auto rounded-md shadow-2xl bg-[#232344] border border-[#35355e] p-8 font-mono max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
          >
            {/* Title & Close button in one row */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`
                  text-xl font-bold tracking-wide
                  ${selectedChallenge.is_solved ? 'text-green-400' : 'text-pink-400'}
                `}
                style={{ fontSize: '1.25rem' }}
              >
                {selectedChallenge.title}
              </h2>
              <button
                className="ml-4 text-gray-400 hover:text-white text-xl"
                onClick={() => {
                  setSelectedChallenge(null);
                  setChallengeTab('challenge');
                }}
                aria-label="Close"
                type="button"
              >✕</button>
            </div>

            {/* Tabs */}
            <div className="flex justify-between gap-2 mb-6">
              <button
                className={`flex-1 px-4 py-1 rounded-t-md font-bold text-sm transition-colors ${challengeTab === 'challenge' ? 'bg-[#35355e] text-pink-300' : 'bg-[#232344] text-gray-300 hover:text-pink-200'}`}
                onClick={() => setChallengeTab('challenge')}
              >Challenge</button>
              <button
                className={`flex-1 px-4 py-1 rounded-t-md font-bold text-sm transition-colors ${challengeTab === 'solvers' ? 'bg-[#35355e] text-pink-300' : 'bg-[#232344] text-gray-300 hover:text-pink-200'}`}
                onClick={() => handleTabChange('solvers', selectedChallenge.id)}
              >{solvers.length || ""} solve</button>
            </div>

            {/* Tab Content */}
            {challengeTab === 'challenge' && (
              <>
                {/* Badge bar: difficulty, category, coin */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-3 py-1 rounded text-sm font-semibold
                      ${selectedChallenge.difficulty === 'Easy' ? 'bg-green-200 text-green-800' : ''}
                      ${selectedChallenge.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-800' : ''}
                      ${selectedChallenge.difficulty === 'Hard' ? 'bg-red-200 text-red-800' : ''}
                    `}>
                      {selectedChallenge.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded text-sm font-semibold bg-blue-200 text-blue-800">
                      {selectedChallenge.category}
                    </span>
                  </div>
                  <span
                    className={`
                      flex items-center gap-1 text-base font-bold
                      ${selectedChallenge.is_solved ? 'text-green-300' : 'text-yellow-300'}
                    `}
                  >
                    🪙 {selectedChallenge.points}
                  </span>
                </div>
                {/* Description */}
                <div className="mb-3 text-gray-200 text-sm whitespace-pre-line">
                  <MarkdownRenderer content={selectedChallenge.description} />
                </div>
                {/* Attachments */}
                {selectedChallenge.attachments && selectedChallenge.attachments.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {selectedChallenge.attachments.map((attachment, idx) => {
                      const displayName = attachment.name?.length > 40
                        ? attachment.name.slice(0, 37) + "..."
                        : attachment.name;

                      return attachment.type === 'file' ? (
                        <button
                          key={idx}
                          type="button"
                          title={attachment.name}
                          className="block text-pink-400 underline text-xs hover:text-pink-300 break-all"
                          onClick={e => {
                            e.stopPropagation()
                            downloadFile(attachment, `${selectedChallenge.id}-${idx}`)
                          }}
                          disabled={downloading[`${selectedChallenge.id}-${idx}`]}
                        >
                          {downloading[`${selectedChallenge.id}-${idx}`] ? 'Mengunduh...' : displayName}
                        </button>
                      ) : (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={attachment.url}
                          className="block text-pink-400 underline text-xs hover:text-pink-300 break-all"
                        >
                          {displayName || attachment.url.slice(0, 40) + "..."}
                        </a>
                      )
                    })}
                  </div>
                )}
                {/* Flag input */}
                <form
                  className="flex gap-2 mt-4"
                  onSubmit={e => {
                    e.preventDefault();
                    handleFlagSubmit(selectedChallenge.id);
                  }}
                >
                  <input
                    type="text"
                    value={flagInputs[selectedChallenge.id] || ''}
                    onChange={e => handleFlagInputChange(selectedChallenge.id, e.target.value)}
                    placeholder="Flag"
                    className="flex-1 px-3 py-2 rounded border border-[#35355e] bg-[#181829] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={submitting[selectedChallenge.id] || !flagInputs[selectedChallenge.id]?.trim()}
                    className="px-5 py-2 rounded bg-gradient-to-br from-pink-500 to-pink-400 text-white font-bold shadow hover:from-pink-400 hover:to-pink-500 transition disabled:opacity-50"
                  >
                    {submitting[selectedChallenge.id] ? '...' : 'Submit'}
                  </button>
                </form>
              </>
            )}
            {challengeTab === 'solvers' && (
              <div>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {solvers.length === 0 ? (
                    <li className="text-gray-400">Belum ada yang solve.</li>
                  ) : (
                    solvers.map((solver, idx) => (
                      <li key={idx} className="flex justify-between text-gray-200 items-center">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/user/${solver.username}`}
                            className={`hover:underline ${idx === 0 ? 'font-bold text-red-400' : 'text-pink-300'}`}
                          >
                            {solver.username}
                          </a>
                          {idx === 0 && (
                            <span title="First Blood" className="text-red-400 text-lg font-bold">🩸</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(solver.solvedAt).toLocaleString()}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

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
