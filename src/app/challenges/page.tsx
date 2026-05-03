'use client'

// React Imports
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Flag, Zap, Search, CalendarClock, CalendarX, CircleAlert } from 'lucide-react'

// Shared Imports
import APP from '@/config'
import { getChallengesList, getChallengeDetail, submitFlag, getSolversByChallenge, getMyTeamChallenges, getMyEventMembership, getAllMyEventMemberships, getAdminScope, getChallengeFilterSettings, setChallengeFilterSettings, formatEventDurationCompact  } from '@/shared/lib'
import { useEventContext, useFilterContext } from '@/shared/contexts'
import { ImageWithFallback, Loader, TitlePage } from '@/shared/components'
import { ChallengeWithSolve, Attachment, EventMembershipStatus } from '@/shared/types'

// Local Imports
import { ChallengeCard, ChallengeDetailDialog, ChallengeFilterBar, ChallengeFilterSidebar, EventsTab, JoinEventDialog } from './_components'
import { buildFuzzyOrderedList, getDifficultyOrder, normalizeChallengeHints, sortChallengesByDisplayPriority, groupChallengesByCategory } from './_lib'
import type { ChallengeDialogTab, ChallengeFilterSettings, ChallengesMainTab, EventSelectorValue, HintModalState, KeyedBooleanMap, KeyedFlagFeedbackMap, KeyedStringMap, Solver } from './_types'

export default function ChallengesPage() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState<ChallengesMainTab>('challenges')
  const [challengeTab, setChallengeTab] = useState<ChallengeDialogTab>('challenge');
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [flagInputs, setFlagInputs] = useState<KeyedStringMap>({})
  const [flagFeedback, setFlagFeedback] = useState<KeyedFlagFeedbackMap>({})
  const [submitting, setSubmitting] = useState<KeyedBooleanMap>({})
  const [showHintModal, setShowHintModal] = useState<HintModalState>({ challenge: null })
  const [downloading, setDownloading] = useState<KeyedBooleanMap>({})
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolve | null>(null)
  const { filters, setFilters, layoutMode } = useFilterContext()
  const { events, selectedEvent, setSelectedEvent } = useEventContext()
  const eventId: EventSelectorValue = selectedEvent === 'main' ? null : (selectedEvent as any)
  const [filterSettings, setFilterSettings] = useState<ChallengeFilterSettings>({
    hideMaintenance: false,
    highlightTeamSolves: true,
  })
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [eventMembership, setEventMembership] = useState<EventMembershipStatus | null>(null)
  const [eventMembershipLoading, setEventMembershipLoading] = useState(false)
  const [isGlobalAdminUser, setIsGlobalAdminUser] = useState(false)
  const [eventAdminIds, setEventAdminIds] = useState<string[]>([])
  const [targetEventId, setTargetEventId] = useState<string | null>(null)
  const [targetEventMembership, setTargetEventMembership] = useState<any>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const { user, loading } = require('@/shared/contexts').useAuth();
  const [isChallengesLoading, setIsChallengesLoading] = useState(true)
  const [allMembershipsLoaded, setAllMembershipsLoaded] = useState(false)

  // In-memory caches to reduce repeated network usage
  const [challengeDetailCache] = useState(() => new Map<string, ChallengeWithSolve>())
  const [solversCache] = useState(() => new Map<string, Solver[]>())
  const [eventMembershipCache] = useState(() => new Map<string, EventMembershipStatus | null>())

  // Saat tab solvers dibuka, fetch solvers
  const fetchSolversForChallenge = async (challengeId: string) => {
    const cached = solversCache.get(challengeId)
    if (cached) {
      setSolvers(cached)
      return
    }

    try {
      const data = await getSolversByChallenge(challengeId)
      solversCache.set(challengeId, data)
      setSolvers(data)
    } catch (err) {
      setSolvers([])
    }
  }

  const handleTabChange = async (tab: ChallengeDialogTab, challengeId: string) => {
    setChallengeTab(tab)
    if (tab === 'solvers') {
      await fetchSolversForChallenge(challengeId)
    }
  }

  const getCachedEventMembership = async (id: string, force = false) => {
    if (!force && eventMembershipCache.has(id)) {
      return eventMembershipCache.get(id)!
    }
    const data = await getMyEventMembership(id)
    eventMembershipCache.set(id, data)
    return data
  }

  // Difficulty ranking available across the component so multiple sorts can use it
  const difficultyOrder = getDifficultyOrder((APP as any).difficultyStyles)

  const formatRemaining = (ms: number) => formatEventDurationCompact(ms)

  const selectedEventObj = (typeof eventId === 'string' && eventId !== 'all') ? events.find(e => e.id === eventId) : null;
  const nowDate = new Date();
  const selectedEventStart = selectedEventObj?.start_time ? new Date(selectedEventObj.start_time) : null;
  const selectedEventEnd = selectedEventObj?.end_time ? new Date(selectedEventObj.end_time) : null;
  const selectedEventNotStarted = !!(selectedEventStart && nowDate < selectedEventStart);
  const selectedEventEnded = !!(selectedEventEnd && nowDate > selectedEventEnd);
  const loadChallenges = async () => {
    if (!user) return
    setIsChallengesLoading(true)

    try {
      const [challengesData, teamChallengesResult] = await Promise.all([
        getChallengesList(user.id, false, 'all'),
        APP.teams.enabled ? getMyTeamChallenges() : Promise.resolve({ challenges: [] }),
      ])

      const sortedChallenges = sortChallengesByDisplayPriority(challengesData || [], difficultyOrder)
      const teamSolvedIds = new Set((teamChallengesResult?.challenges || []).map((c: any) => c.challenge_id))

      // List payload is intentionally lightweight: hint/attachments/description are empty here.
      setChallenges(
        sortedChallenges.map((challenge: any) => ({
          ...challenge,
          hint: [],
          attachments: [],
          description: typeof challenge.description === 'string' ? challenge.description : '',
          is_team_solved: teamSolvedIds.has(challenge.id),
        }))
      )
    } finally {
      setIsChallengesLoading(false)
    }
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
    let mounted = true

    const loadScope = async () => {
      if (!user) {
        if (mounted) {
          setIsGlobalAdminUser(false)
          setEventAdminIds([])
        }
        return
      }

      const scope = await getAdminScope()
      if (!mounted) return
      setIsGlobalAdminUser(!!scope.is_global_admin)
      setEventAdminIds(scope.event_ids || [])
    }

    void loadScope()

    return () => {
      mounted = false
    }
  }, [user])

  useEffect(() => {
    let mounted = true
    const loadAllMemberships = async () => {
      if (!user) return
      try {
        const allMemberships = await getAllMyEventMemberships()
        if (!mounted) return
        allMemberships.forEach(m => eventMembershipCache.set(m.event_id, m))
        setAllMembershipsLoaded(true)

        if (typeof eventId === 'string' && eventId !== 'all') {
           const m = eventMembershipCache.get(eventId)
           if (m) {
             setEventMembership(m)
             setEventMembershipLoading(false)
           }
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadAllMemberships()
    return () => { mounted = false }
  }, [user, eventMembershipCache, eventId])

  useEffect(() => {
    let mounted = true
    const loadMembership = async () => {
      if (!user || typeof eventId !== 'string' || eventId === 'all') {
        if (mounted) setEventMembership(null)
        return
      }

      if (eventMembership?.event_id === eventId) return

      if (eventMembershipCache.has(eventId)) {
        if (mounted) setEventMembership(eventMembershipCache.get(eventId) || null)
        return
      }

      setEventMembershipLoading(true)
      try {
        const data = await getCachedEventMembership(eventId)
        if (!mounted) return
        setEventMembership(data)
      } finally {
        if (mounted) setEventMembershipLoading(false)
      }
    }

    void loadMembership()

    return () => {
      mounted = false
    }
  }, [user, eventId])

  // Events are loaded globally via EventProvider

  // Solvers are fetched on-demand when the Solvers tab is opened.

  const openChallenge = async (challenge: ChallengeWithSolve) => {
    setChallengeTab('challenge')
    setSolvers([])
    const cached = challengeDetailCache.get(challenge.id)
    if (cached) {
      setSelectedChallenge({
        ...challenge,
        ...cached,
        hint: normalizeChallengeHints((cached as any).hint),
      } as any)
      return
    }

    // Open immediately with lightweight data; detail will be filled in.
    setSelectedChallenge({
      ...challenge,
      description: challenge.description || 'Loading...',
      hint: Array.isArray((challenge as any).hint) ? (challenge as any).hint : [],
      attachments: Array.isArray((challenge as any).attachments) ? (challenge as any).attachments : [],
    } as any)

    const detail = await getChallengeDetail(challenge.id)
    if (!detail) return
    challengeDetailCache.set(challenge.id, detail)

    // Only update if the same challenge is still open
    setSelectedChallenge((prev) => {
      if (!prev || prev.id !== challenge.id) return prev
      return {
        ...prev,
        ...detail,
        hint: normalizeChallengeHints((detail as any).hint),
      } as any
    })
  }

  // Load filter settings from localStorage (once)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = getChallengeFilterSettings()
      if (stored) setFilterSettings(stored)
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
      setChallengeFilterSettings(filterSettings)
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

      // Only refresh challenge list when something actually changes (solve success).
      if (result?.success) {
        await loadChallenges()
      }

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

  const attemptEventSelect = async (id: string | null | 'all') => {
    if (id === eventId) {
      if (currentTab === 'events') setCurrentTab('challenges')
      return
    }

    if (id === null || id === 'all') {
      setSelectedEvent(id === null ? 'main' : id)
      if (currentTab === 'events') setCurrentTab('challenges')
      return
    }

    const evt = events.find(e => e.id === id)
    if (!evt) return

    const joinMode = evt.join_mode || 'open'
    const isSelectedEventAdmin = eventAdminIds.includes(id)
    const canBypass = isGlobalAdminUser || isSelectedEventAdmin

    if (canBypass || joinMode === 'open') {
      setSelectedEvent(id)
      if (currentTab === 'events') setCurrentTab('challenges')
      return
    }

    let membership = eventMembershipCache.get(id)
    if (membership === undefined) {
      const toastId = toast.loading('Checking access...')
      try {
        membership = await getCachedEventMembership(id)
      } catch (err) {
        console.error(err)
        toast.error('Failed to check access')
        membership = null
      } finally {
        toast.dismiss(toastId)
      }
    }

    if (membership?.is_member) {
      setEventMembership(membership)
      setSelectedEvent(id)
      if (currentTab === 'events') setCurrentTab('challenges')
    } else {
      setTargetEventId(id)
      setTargetEventMembership({ evt, joinMode, membership })
      setIsJoinDialogOpen(true)
    }
  }

  const selectedJoinMode = eventMembership?.join_mode || (selectedEventObj?.join_mode || 'open')
  const isSelectedEventAdmin = typeof eventId === 'string' && eventId !== 'all' && eventAdminIds.includes(eventId)
  const canBypassEventJoin = isGlobalAdminUser || isSelectedEventAdmin
  const eventJoinBlocked =
    typeof eventId === 'string' &&
    eventId !== 'all' &&
    selectedJoinMode !== 'open' &&
    !eventMembership?.is_member &&
    !canBypassEventJoin

  // Filter challenges based on current filters
  const filteredChallenges = challenges.filter(challenge => {
    // Special case: when viewing All events, force Intro category to Main only
    if (eventId === 'all') {
      // For Event challenges, only show when event is ongoing.
      // Hide upcoming and ended events in All view.
      if (challenge.event_id) {
        const event = events.find(e => e.id === challenge.event_id)
        if (!event) return false

        const now = Date.now()
        const start = event.start_time ? new Date(event.start_time).getTime() : null
        const end = event.end_time ? new Date(event.end_time).getTime() : null

        if (start && !Number.isNaN(start) && now < start) return false
        if (end && !Number.isNaN(end) && now > end) return false
      }
      const isIntro = String(challenge.category || '').toLowerCase() === 'intro'
      const isMain = challenge.event_id === null || typeof challenge.event_id === 'undefined'
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
      const desc = typeof challenge.description === 'string' ? challenge.description : ''
      const descMatch = desc.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  });

  // Preferred order for categories (ambil dari config)
  const preferredOrder = APP.challengeCategories || []

  // Get unique categories and difficulties for filter options
  const allCategories = Array.from(new Set(challenges.map(c => c.category))).filter(Boolean) as string[]
  const categories = buildFuzzyOrderedList(preferredOrder, allCategories)

  const difficulties = Array.from(new Set(challenges.map(c => c.difficulty))).sort()

  // Pre-compute grouping and ordering for rendering to avoid JSX IIFE parsing issues
  const grouped = groupChallengesByCategory(filteredChallenges)

  const groupKeys = Object.keys(grouped)
  const orderedKeys = buildFuzzyOrderedList(preferredOrder, groupKeys)

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
  const enrichedEvents = events.map(e => {
    const isGlobalAdmin = isGlobalAdminUser
    const isEventAdmin = eventAdminIds.includes(e.id)
    const canBypass = isGlobalAdmin || isEventAdmin
    const m = eventMembershipCache.get(e.id)
    const isLocked = !allMembershipsLoaded ? false : (!canBypass && e.join_mode !== 'open' && !m?.is_member)
    return { ...e, isLocked }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop fixed sidebar placed outside the centered container */}
      {/* <div className="hidden lg:block fixed top-20 w-72 h-[calc(100vh-5rem)] overflow-auto z-20 left-[calc((100vw-72rem)/2-17rem)]">
        <ChallengeFilterSidebar
          filters={filters}
          events={events.map(e => ({ id: e.id, name: e.name, start_time: e.start_time, end_time: e.end_time }))}
          selectedEventId={eventId}
          onEventChange={(id) => setSelectedEvent(id === null ? 'main' : id)}
          categories={categories}
          difficulties={difficulties}
          onFilterChange={setFilters}
          onClear={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '' })}
        />
      </div> */}

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
              events={enrichedEvents}
              selectedEventId={eventId}
              onEventChange={attemptEventSelect}
              hideMainEventOption={APP.hideEventMain}
              settings={filterSettings}
              categories={categories}
              difficulties={difficulties}
              onFilterChange={setFilters}
              onSettingsChange={(newSettings) => {
                setFilterSettings(newSettings)
                setChallengeFilterSettings(newSettings)
              }}
              onClear={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '' })}
            />

            {/* Challenges Grid Grouped by Category */}
            <div>
              {eventMembershipLoading && eventMembership?.event_id !== eventId ? (
                <Loader fullscreen color="text-orange-500" />
              ) : eventJoinBlocked ? (
                <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
                  Challenge dikunci sampai kamu join event.
                </div>
              ) : (
                !user || loading || isChallengesLoading ? (
                  <Loader fullscreen color="text-orange-500" />
                ) : filteredChallenges.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      {typeof eventId === 'string' && selectedEventNotStarted ? (
                        <CalendarClock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                      ) : typeof eventId === 'string' && selectedEventEnded ? (
                        <CalendarX className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                      ) : typeof eventId === 'string' && eventId !== 'all' && !selectedEventObj ? (
                        <CircleAlert className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <Search className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    {typeof eventId === 'string' && selectedEventNotStarted ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Event belum mulai
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Starts in {formatRemaining(selectedEventStart!.getTime() - nowDate.getTime())}
                        </p>
                      </>
                    ) : typeof eventId === 'string' && selectedEventEnded ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Event telah berakhir
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Challenge untuk event ini sudah tidak tersedia.
                        </p>
                      </>
                    ) : typeof eventId === 'string' && eventId !== 'all' && !selectedEventObj ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Event tidak ditemukan
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Silakan pilih event lain.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {challenges.length === 0
                            ? 'No challenges available'
                            : 'No challenges match your filters'
                          }
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {challenges.length === 0
                            ? 'Check back later for new challenges'
                            : 'Try adjusting your filter criteria'
                          }
                        </p>
                      </>
                    )}
                  </div>
                ) : layoutMode === 'compact' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {sortChallengesByDisplayPriority(filteredChallenges, difficultyOrder)
                      .map((challenge) => (
                        <div key={challenge.id} className="relative">
                          <ChallengeCard
                            challenge={challenge}
                            highlightTeamSolves={filterSettings.highlightTeamSolves}
                            showCategory={true}
                            onClick={() => openChallenge(challenge)}
                          />
                        </div>
                      ))}
                  </motion.div>
                ) : (
                  orderedKeys.map((category) => (
                    <div key={category} className="mb-12">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-orange-400 dark:text-orange-300 text-2xl">{'»'}</span>
                        <h2 className="text-xl sm:text-2xl tracking-widest font-bold uppercase text-gray-800 dark:text-white">
                          {eventId === 'all' && String(category).toLowerCase() === 'intro'
                            ? `Intro (${String(APP.eventMainLabel || 'Main')})`
                            : category}
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
                            onClick={() => openChallenge(challenge)}
                          />
                        ))}
                      </motion.div>
                    </div>
                  ))
                )
              )}
            </div>
          </>
        )}

        {/* EVENTS TAB */}
        {currentTab === 'events' && (
          <EventsTab
            events={enrichedEvents}
            selectedEventId={eventId}
            onEventSelect={attemptEventSelect}
          />
        )}
      </div>

      {/* Dialog tetap bisa pakai !user cek */}
      {user && (
        <>
          <JoinEventDialog
            open={isJoinDialogOpen}
            onOpenChange={setIsJoinDialogOpen}
            event={targetEventMembership?.evt || null}
            joinMode={targetEventMembership?.joinMode || 'open'}
            membershipData={targetEventMembership?.membership || null}
            onSuccess={async () => {
              if (targetEventId) {
                const membership = await getCachedEventMembership(targetEventId, true)
                setEventMembership(membership)
                setSelectedEvent(targetEventId)
                if (currentTab === 'events') setCurrentTab('challenges')
              }
              setIsJoinDialogOpen(false)
            }}
          />

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
        </>
      )}
    </div>
  )
}
