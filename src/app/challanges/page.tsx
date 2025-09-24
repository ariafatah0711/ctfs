'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges, submitFlag, getSolversByChallenge } from '@/lib/challenges'
import { ChallengeWithSolve, User, Attachment } from '@/types'

import { motion } from 'framer-motion'
import ChallengeCard from '@/components/challanges/ChallengeCard'
import ChallengeDetailDialog from '@/components/challanges/ChallengeDetailDialog'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'

import { Solver } from '@/components/challanges/SolversList';
import ChallengeFilterBar from '@/components/challanges/ChallengeFilterBar'

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
  const [flagFeedback, setFlagFeedback] = useState<{[key: string]: { success: boolean, message: string } | null}>({})
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({})
  const [expandedChallenges, setExpandedChallenges] = useState<{[key: string]: boolean}>({})
  const [showHintModal, setShowHintModal] = useState<{challenge: ChallengeWithSolve | null, hintIdx?: number}>({challenge: null})
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
      // Normalize hint field to string[] for each challenge
      const normalizedChallenges = challengesData.map((challenge: any) => {
        let hints: string[] = [];
        const raw = challenge.hint;
        if (Array.isArray(raw)) {
          hints = raw.filter((h: any) => typeof h === 'string');
        } else if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              hints = parsed.filter((h: any) => typeof h === 'string');
            } else if (typeof parsed === 'string') {
              hints = [parsed];
            } else if (parsed === null) {
              hints = [];
            }
          } catch {
            if (raw.trim() !== '') hints = [raw];
          }
        } else if (raw && typeof raw === 'object') {
          // ignore unexpected object
        } else if (raw) {
          hints = [String(raw)];
        }
        return { ...challenge, hint: hints };
      });
      setChallenges(normalizedChallenges);
      setLoading(false);
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
    setFlagFeedback(prev => ({ ...prev, [challengeId]: null })) // reset dulu

    try {
      const result = await submitFlag(challengeId, flagInputs[challengeId].trim())

      // Refresh challenge list & user
      const challengesData = await getChallenges(user.id)
      setChallenges(challengesData)
      const updatedUser = await getCurrentUser()
      setUser(updatedUser)

      // set feedback box
      setFlagFeedback(prev => ({
        ...prev,
        [challengeId]: { success: result.success, message: result.message }
      }))

      if (result.success) {
        setFlagInputs(prev => ({ ...prev, [challengeId]: '' }))
        // setSelectedChallenge(null)
        // setChallengeTab('challenge')
      }
    } catch (error) {
      console.error('Error submitting flag:', error)
      setFlagFeedback(prev => ({
        ...prev,
        [challengeId]: { success: false, message: "Failed to submit flag" }
      }))
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

  if (!user) return null
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <TitlePage>🚩 challanges</TitlePage>

        <ChallengeFilterBar
          filters={filters}
          categories={categories}
          difficulties={difficulties}
          onFilterChange={setFilters}
          onClear={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '' })}
          showStatusFilter={true}
        />

        {/* Challenges Grid Grouped by Category */}
        <div>
          {!user || loading ? (
            <Loader fullscreen color="text-orange-500" />
          ) : filteredChallenges.length === 0 ? (
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
            Object.entries(
              filteredChallenges.reduce((acc, challenge) => {
                if (!acc[challenge.category]) acc[challenge.category] = []
                acc[challenge.category].push(challenge)
                return acc
              }, {} as {[key: string]: ChallengeWithSolve[]})
            ).map(([category, categoryChallenges]) => (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-orange-400 text-2xl">{'»'}</span>
                  <h2 className="text-xl sm:text-2xl tracking-widest text-gray-800 font-bold uppercase">{category}</h2>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {categoryChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </motion.div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog tetap bisa pakai !user cek */}
      {user && (
        <ChallengeDetailDialog
          open={!!selectedChallenge}
          challenge={selectedChallenge}
          solvers={solvers}
          challengeTab={challengeTab}
          setChallengeTab={(tab, challengeId) => {
            if (tab === 'solvers' && selectedChallenge) {
              handleTabChange(tab, selectedChallenge.id)
            } else {
              setChallengeTab(tab)
            }
          }}
          onClose={() => {
            setSelectedChallenge(null)
            setChallengeTab('challenge')
          }}
          flagInputs={flagInputs}
          handleFlagInputChange={handleFlagInputChange}
          handleFlagSubmit={handleFlagSubmit}
          submitting={submitting}
          flagFeedback={flagFeedback}
          downloading={downloading}
          downloadFile={downloadFile}
          showHintModal={showHintModal}
          setShowHintModal={setShowHintModal}
        />
      )}
    </div>
  )
}
