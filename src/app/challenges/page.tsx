'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getChallenges, submitFlag, getSolversByChallenge } from '@/lib/challenges'
import { getEvents } from '@/lib/events'
import { getMyTeamChallenges } from '@/lib/teams'
import { ChallengeWithSolve, User, Attachment, Event } from '@/types'
import { motion } from 'framer-motion'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import ChallengeDetailDialog from '@/components/challenges/ChallengeDetailDialog'
import EventsTab from '@/components/challenges/EventsTab'
import { Flag, Zap } from 'lucide-react'
import Loader from '@/components/custom/loading'
import TitlePage from '@/components/custom/TitlePage'
import { Solver } from '@/components/challenges/SolversList';
import ChallengeFilterBar from '@/components/challenges/ChallengeFilterBar'
import APP from '@/config'
import ImageWithFallback from '@/components/ImageWithFallback'

export default function ChallengesPage() {
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
  const [currentTab, setCurrentTab] = useState<'challenges' | 'events'>('challenges')
  const [challengeTab, setChallengeTab] = useState<'challenge' | 'solvers'>('challenge');
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [flagInputs, setFlagInputs] = useState<{[key: string]: string}>({})
  const [flagFeedback, setFlagFeedback] = useState<{[key: string]: { success: boolean, message: string } | null}>({})
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({})
  const [showHintModal, setShowHintModal] = useState<{challenge: ChallengeWithSolve | null, hintIdx?: number}>({challenge: null})
  const [downloading, setDownloading] = useState<{[key: string]: boolean}>({})
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolve | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    difficulty: 'all',
    search: ''
  })
  const [eventId, setEventId] = useState<string | null | 'all'>('all')
  const [events, setEvents] = useState<Event[]>([])
  const [filterSettings, setFilterSettings] = useState({
    hideMaintenance: false,
    highlightTeamSolves: true,
  })
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const { user, loading } = require('@/contexts/AuthContext').useAuth();
  const loadChallenges = async () => {
    if (!user) return
    const challengesData = await getChallenges(user.id, false, 'all')

    let teamSolvedIds = new Set<string>()
    if (APP.teams.enabled) {
      const { challenges: teamChallenges } = await getMyTeamChallenges()
      teamSolvedIds = new Set((teamChallenges || []).map((c: any) => c.challenge_id))
    }

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
      return {
        ...challenge,
        hint: hints,
        is_team_solved: teamSolvedIds.has(challenge.id),
      };
    });

    setChallenges(normalizedChallenges)
  }
  // Redirect ke /login jika user belum login dan sudah selesai loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadChallenges()
  }, [user])

  useEffect(() => {
    getEvents().then(setEvents).catch(() => setEvents([]))
  }, [])

  // Tambahkan useEffect ini setelah deklarasi state
  useEffect(() => {
    if (selectedChallenge) {
      // Fetch solvers setiap kali challenge detail dibuka
      getSolversByChallenge(selectedChallenge.id)
        .then(setSolvers)
        .catch(() => setSolvers([]));
    }
  }, [selectedChallenge]);

  // Load filter settings from localStorage (once)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('ctf.challengeFilterSettings')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed?.hideMaintenance === 'boolean' && typeof parsed?.highlightTeamSolves === 'boolean') {
          setFilterSettings({
            hideMaintenance: parsed.hideMaintenance,
            highlightTeamSolves: parsed.highlightTeamSolves,
          })
        }
      }
    } catch {
      // ignore malformed storage
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  // Persist filter settings to localStorage
  useEffect(() => {
    if (!settingsLoaded || typeof window === 'undefined') return
    try {
      window.localStorage.setItem('ctf.challengeFilterSettings', JSON.stringify(filterSettings))
    } catch {
      // ignore storage errors
    }
  }, [filterSettings, settingsLoaded])

  const handleFlagSubmit = async (challengeId: string) => {
    if (!user || !flagInputs[challengeId]?.trim()) return

    setSubmitting(prev => ({ ...prev, [challengeId]: true }))
    setFlagFeedback(prev => ({ ...prev, [challengeId]: null })) // reset dulu

    try {
      const result = await submitFlag(challengeId, flagInputs[challengeId].trim())

      // Refresh challenge list
      await loadChallenges()

      // set feedback box
      setFlagFeedback(prev => ({
        ...prev,
        [challengeId]: { success: result.success, message: result.message }
      }))

      if (result.success) {
        const audio = new Audio('/sounds/succes.wav')
        audio.volume = 0.3
        audio.play().catch(() => {})

        // 🎉 tampilkan confetti
        import('canvas-confetti').then((confetti) => {
          const duration = 0.8 * 1000
          const end = Date.now() + duration

          const frame = () => {
            confetti.default({
              particleCount: 3, // lebih sedikit
              startVelocity: 20, // gak terlalu cepat
              spread: 360, // gak terlalu lebar
              ticks: 80, // agak lama
              gravity: 0.8, // jatuh pelan
              scalar: 0.8, // kecil dikit
              colors: ['#00e0ff', '#ffffff', '#ff7b00'], // warna sesuai tema
              origin: { x: Math.random(), y: Math.random() - 0.2 },
            })

            if (Date.now() < end) requestAnimationFrame(frame)
          }

          frame()
        })

        setFlagInputs(prev => ({ ...prev, [challengeId]: '' }))
      } else {
        const audio = new Audio('/sounds/incorect.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {})
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

  // Filter challenges based on current filters
  const filteredChallenges = challenges.filter(challenge => {
    // Special case: when viewing All events, force Intro category to Main only
    if (eventId === 'all') {
      // Hide challenges whose event has ended
      if (challenge.event_id) {
        const event = events.find(e => e.id === challenge.event_id);
        if (event && event.end_time) {
          const now = new Date();
          const endTime = new Date(event.end_time);
          if (endTime < now) return false;
        }
      }
      const isIntro = String(challenge.category || '').toLowerCase() === 'intro';
      const isMain = challenge.event_id === null || typeof challenge.event_id === 'undefined';
      if (isIntro && !isMain) return false;
    }

    if (eventId !== 'all') {
      const matchMain = eventId === null && (challenge.event_id === null || typeof challenge.event_id === 'undefined');
      const matchEvent = typeof eventId === 'string' && eventId !== null && challenge.event_id === eventId;
      if (!matchMain && !matchEvent) return false;
    }
    if (filterSettings.hideMaintenance && challenge.is_maintenance) return false;
    // Status filter
    if (filters.status === 'solved' && !challenge.is_solved) return false;
    if (filters.status === 'unsolved' && challenge.is_solved) return false;

    // Category filter
    if (filters.category !== 'all' && challenge.category !== filters.category) return false;

    // Difficulty filter
    if (filters.difficulty !== 'all' && challenge.difficulty !== filters.difficulty) return false;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = challenge.title.toLowerCase().includes(searchLower);
      const descMatch = challenge.description.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  });

  // Preferred order for categories (ambil dari config)
  const preferredOrder = APP.challengeCategories || []

  // Get unique categories and difficulties for filter options
  const allCategories = Array.from(new Set(challenges.map(c => c.category))).filter(Boolean)
  // Build categories by fuzzy-matching preferredOrder items (substring, case-insensitive)
  const matchedCategorySet = new Set<string>()
  const categories = [
    ...preferredOrder.flatMap(p => {
      const pLower = p.toLowerCase()
      const found = allCategories.find(c => {
        const cLower = c.toLowerCase()
        return cLower.includes(pLower) || pLower.includes(cLower)
      })
      if (found && !matchedCategorySet.has(found)) {
        matchedCategorySet.add(found)
        return found
      }
      return [] as string[]
    }),
    ...allCategories.filter(c => !matchedCategorySet.has(c)).sort()
  ]

  const difficulties = Array.from(new Set(challenges.map(c => c.difficulty))).sort()

  // Pre-compute grouping and ordering for rendering to avoid JSX IIFE parsing issues
  const grouped = filteredChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) acc[challenge.category] = []
    acc[challenge.category].push(challenge)
    return acc
  }, {} as {[key: string]: ChallengeWithSolve[]})

  const groupKeys = Object.keys(grouped)
  // Fuzzy match group keys against preferredOrder
  const matchedKeySet = new Set<string>()
  const orderedKeys = [
    ...preferredOrder.flatMap(p => {
      const pLower = p.toLowerCase()
      const found = groupKeys.find(k => {
        const kLower = k.toLowerCase()
        return kLower.includes(pLower) || pLower.includes(kLower)
      })
      if (found && !matchedKeySet.has(found)) {
        matchedKeySet.add(found)
        return found
      }
      return [] as string[]
    }),
    ...groupKeys.filter(k => !matchedKeySet.has(k)).sort()
  ]

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

  if (loading) return <Loader fullscreen color="text-orange-500" />
  // Jangan render apapun jika belum login, biar redirect jalan
  if (!user) return null
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* <TitlePage icon={<Flag size={30} className="text-orange-500 dark:text-orange-300 drop-shadow" />}>challenges</TitlePage> */}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentTab('challenges')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              currentTab === 'challenges'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag size={16} />
              Challenges
            </div>
          </button>
          <button
            onClick={() => setCurrentTab('events')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              currentTab === 'events'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} />
              Events
            </div>
          </button>
        </div>

        {/* Subtle background logo watermark */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.08] dark:opacity-[0.06] z-0">
        <ImageWithFallback
            src={APP.image_icon}
            alt={`${APP.shortName} watermark`}
            size={720}
            className="rounded-[3rem]"
          />
        </div>

        {/* CHALLENGES TAB */}
        {currentTab === 'challenges' && (
          <>
            <ChallengeFilterBar
              filters={filters}
              settings={filterSettings}
              categories={categories}
              difficulties={difficulties}
              onFilterChange={setFilters}
              onSettingsChange={setFilterSettings}
              onClear={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '' })}
              showStatusFilter={true}
              events={events.map(e => ({ id: e.id, name: e.name, start_time: e.start_time, end_time: e.end_time }))}
              selectedEventId={eventId}
              onEventChange={setEventId}
            />

            {/* Challenges Grid Grouped by Category */}
            <div>
              {!user || loading ? (
                <Loader fullscreen color="text-orange-500" />
              ) : filteredChallenges.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400 dark:text-gray-500">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {challenges.length === 0
                      ? "No challenges available"
                      : "No challenges match your filters"
                    }
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {challenges.length === 0
                      ? "Check back later for new challenges"
                      : "Try adjusting your filter criteria"
                    }
                  </p>
                </div>
              ) : (
                orderedKeys.map((category) => (
                  <div key={category} className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-orange-400 dark:text-orange-300 text-2xl">{'»'}</span>
                      <h2 className="text-xl sm:text-2xl tracking-widest font-bold uppercase text-gray-800 dark:text-white">
                        {eventId === 'all' && String(category).toLowerCase() === 'intro' ? 'Intro (Main)' : category}
                      </h2>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                      {grouped[category].map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          highlightTeamSolves={filterSettings.highlightTeamSolves}
                          onClick={() => setSelectedChallenge(challenge)}
                        />
                      ))}
                    </motion.div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* EVENTS TAB */}
        {currentTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EventsTab
              events={events}
              selectedEventId={eventId}
              onEventSelect={(selected) => {
                setEventId(selected)
                setCurrentTab('challenges')
              }}
            />
          </motion.div>
        )}
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
          events={events}
        />
      )}
    </div>
  )
}
