'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import APP from '@/config'
import {
  getChallengesList,
  getChallengeDetail,
  submitFlag,
  getSolversByChallenge,
  getMyTeamChallenges,
  getMyEventMembership,
  getAllMyEventMemberships,
  getAdminScope,
  getChallengeFilterSettings,
  setChallengeFilterSettings,
  formatEventDurationCompact,
} from '@/shared/lib'
import { useAuth, useEventContext, useFilterContext, useSubChallenges } from '@/shared/contexts'
import { Attachment, ChallengeWithSolve, EventMembershipStatus } from '@/shared/types'
import {
  buildFuzzyOrderedList,
  getDifficultyOrder,
  normalizeChallengeHints,
  sortChallengesByDisplayPriority,
  sortChallengesByNewest,
  groupChallengesByCategory,
  persistSelectedChallenge,
  getStoredSelectedChallengeId,
} from '../_lib'
import type {
  ChallengeDialogTab,
  ChallengeFilterSettings,
  ChallengesMainTab,
  EventSelectorValue,
  HintModalState,
  KeyedBooleanMap,
  KeyedFlagFeedbackMap,
  KeyedStringMap,
  Solver,
} from '../_types'

export function useChallengesPageData() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState<ChallengesMainTab>('challenges')
  const [challengeTab, setChallengeTab] = useState<ChallengeDialogTab>('challenge')
  const [solvers, setSolvers] = useState<Solver[]>([])
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [flagInputs, setFlagInputs] = useState<KeyedStringMap>({})
  const [flagFeedback, setFlagFeedback] = useState<KeyedFlagFeedbackMap>({})
  const [submitting, setSubmitting] = useState<KeyedBooleanMap>({})
  const [placeholders, setPlaceholders] = useState<KeyedStringMap>({})
  const [showHintModal, setShowHintModal] = useState<HintModalState>({ challenge: null })
  const [downloading, setDownloading] = useState<KeyedBooleanMap>({})
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolve | null>(null)
  const { filters, setFilters, layoutMode, sortMode, setSortMode } = useFilterContext()
  const { events, selectedEvent, setSelectedEvent } = useEventContext()
  const {
    getState: getSubChallengeState,
    getAnswers: getSubChallengeAnswers,
    setAnswer: setSubChallengeAnswer,
    ensureLoaded: ensureSubChallengesLoaded,
    refresh: refreshSubChallenges,
    submit: submitSubChallengeAnswers,
    resetAnswers: resetSubChallengeAnswers,
  } = useSubChallenges()
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
  const { user, loading } = useAuth()
  const [isChallengesLoading, setIsChallengesLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [allMembershipsLoaded, setAllMembershipsLoaded] = useState(false)

  const [challengeDetailCache] = useState(() => new Map<string, ChallengeWithSolve>())
  const [solversCache] = useState(() => new Map<string, Solver[]>())
  const [eventMembershipCache] = useState(() => new Map<string, EventMembershipStatus | null>())

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
    } catch {
      setSolvers([])
    }
  }

  const handleTabChange = async (tab: ChallengeDialogTab, challengeId: string) => {
    setChallengeTab(tab)
    if (tab === 'solvers') {
      await fetchSolversForChallenge(challengeId)
      return
    }
    if (tab === 'question') await ensureSubChallengesLoaded(challengeId)
  }

  const getCachedEventMembership = async (id: string, force = false) => {
    if (!force && eventMembershipCache.has(id)) return eventMembershipCache.get(id)!
    const data = await getMyEventMembership(id)
    eventMembershipCache.set(id, data)
    return data
  }

  const difficultyOrder = getDifficultyOrder((APP as any).difficultyStyles)
  const formatRemaining = (ms: number) => formatEventDurationCompact(ms)

  const selectedEventObj = (typeof eventId === 'string' && eventId !== 'all') ? events.find(e => e.id === eventId) : null
  const nowDate = new Date()
  const selectedEventStart = selectedEventObj?.start_time ? new Date(selectedEventObj.start_time) : null
  const selectedEventEnd = selectedEventObj?.end_time ? new Date(selectedEventObj.end_time) : null
  const selectedEventNotStarted = !!(selectedEventStart && nowDate < selectedEventStart)
  const selectedEventEnded = !!(selectedEventEnd && nowDate > selectedEventEnd)

  const loadChallenges = async () => {
    if (!user) return
    if (initialLoading) setIsChallengesLoading(true)
    try {
      const [challengesData, teamChallengesResult] = await Promise.all([
        getChallengesList(user.id, false, 'all'),
        APP.teams.enabled ? getMyTeamChallenges() : Promise.resolve({ challenges: [] }),
      ])
      const teamSolvedIds = new Set((teamChallengesResult?.challenges || []).map((c: any) => c.challenge_id))
      setChallenges((challengesData || []).map((challenge: any) => ({
        ...challenge,
        hint: [],
        attachments: [],
        description: typeof challenge.description === 'string' ? challenge.description : '',
        is_team_solved: teamSolvedIds.has(challenge.id),
      })))
    } finally {
      if (initialLoading) {
        setIsChallengesLoading(false)
        setInitialLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    loadChallenges()
  }, [user])

  const openChallenge = async (challenge: ChallengeWithSolve) => {
    persistSelectedChallenge(challenge.id)
    setChallengeTab('challenge')
    setSolvers([])
    void refreshSubChallenges(challenge.id)
    if (challenge.flag_placeholder && !placeholders[challenge.id]) {
      import('@/shared/lib/challenges').then(({ getChallengePlaceholder }) => {
        getChallengePlaceholder(challenge.id).then(ph => {
          if (ph) setPlaceholders(prev => ({ ...prev, [challenge.id]: ph }))
        })
      })
    }
    const cached = challengeDetailCache.get(challenge.id)
    if (cached) {
      setSelectedChallenge({ ...challenge, ...cached, hint: normalizeChallengeHints((cached as any).hint) } as any)
      return
    }
    setSelectedChallenge({
      ...challenge,
      description: challenge.description || 'Loading...',
      hint: Array.isArray((challenge as any).hint) ? (challenge as any).hint : [],
      attachments: Array.isArray((challenge as any).attachments) ? (challenge as any).attachments : [],
    } as any)
    const detail = await getChallengeDetail(challenge.id)
    if (!detail) return
    challengeDetailCache.set(challenge.id, detail)
    setSelectedChallenge((prev) => {
      if (!prev || prev.id !== challenge.id) return prev
      return { ...prev, ...detail, hint: normalizeChallengeHints((detail as any).hint) } as any
    })
  }

  const closeChallenge = () => {
    persistSelectedChallenge(null)
    setSelectedChallenge(null)
  }

  useEffect(() => {
    if (initialLoading || challenges.length === 0 || selectedChallenge) return
    const storedChallengeId = getStoredSelectedChallengeId()
    if (!storedChallengeId) return
    const challengeToRestore = challenges.find(c => c.id === storedChallengeId)
    if (challengeToRestore) void openChallenge(challengeToRestore)
    else persistSelectedChallenge(null)
  }, [initialLoading, challenges.length, selectedChallenge])

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
    return () => { mounted = false }
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
    return () => { mounted = false }
  }, [user, eventId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = getChallengeFilterSettings()
      if (stored) setFilterSettings(stored)
    } catch {
      // ignore
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!settingsLoaded || typeof window === 'undefined') return
    try {
      setChallengeFilterSettings(filterSettings)
    } catch {
      // ignore
    }
  }, [filterSettings, settingsLoaded])

  const handleFlagSubmit = async (challengeId: string) => {
    if (!user || !flagInputs[challengeId]?.trim()) return
    setSubmitting(prev => ({ ...prev, [challengeId]: true }))
    setFlagFeedback(prev => ({ ...prev, [challengeId]: null }))
    try {
      const result = await submitFlag(challengeId, flagInputs[challengeId].trim())
      if (result?.success) await loadChallenges()
      setFlagFeedback(prev => ({ ...prev, [challengeId]: { success: result.success, message: result.message } }))
      if (result.success) {
        const audio = new Audio('/sounds/succes.wav')
        audio.volume = 0.3
        audio.play().catch(() => {})
        import('canvas-confetti').then((confetti) => {
          const duration = 0.8 * 1000
          const end = Date.now() + duration
          const frame = () => {
            confetti.default({
              particleCount: 3,
              startVelocity: 20,
              spread: 360,
              ticks: 80,
              gravity: 0.8,
              scalar: 0.8,
              colors: ['#00e0ff', '#ffffff', '#ff7b00'],
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
      setFlagFeedback(prev => ({ ...prev, [challengeId]: { success: false, message: 'Failed to submit flag' } }))
    } finally {
      setSubmitting(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  const handleFlagInputChange = (challengeId: string, value: string) => {
    setFlagInputs(prev => ({ ...prev, [challengeId]: value }))
  }

  const handleSubChallengeAnswerChange = (challengeId: string, orderNumber: number, value: string) => {
    setSubChallengeAnswer(challengeId, orderNumber, value)
  }

  const handleSubChallengeSubmit = async (challengeId: string, orderNumber?: number) => {
    await submitSubChallengeAnswers(challengeId, orderNumber)
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

  const filteredChallenges = challenges.filter(challenge => {
    if (eventId === 'all') {
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
      if (isIntro && !isMain) return false
    }
    if (eventId !== 'all') {
      const matchMain = eventId === null && (challenge.event_id === null || typeof challenge.event_id === 'undefined')
      const matchEvent = typeof eventId === 'string' && challenge.event_id === eventId
      if (!matchMain && !matchEvent) return false
    }
    if (filterSettings.hideMaintenance && challenge.is_maintenance) return false
    const hasQuestions = !!(challenge as any).has_questions
    const hasServices = Array.isArray((challenge as any).services) && (challenge as any).services.length > 0
    const featureType = hasQuestions && hasServices ? 'TS' : hasQuestions ? 'T' : hasServices ? 'S' : 'N'
    if (filters.feature === 'T' && !(featureType === 'T' || featureType === 'TS')) return false
    if (filters.feature === 'S' && !(featureType === 'S' || featureType === 'TS')) return false
    if (filters.status === 'solved' && !challenge.is_solved) return false
    if (filters.status === 'unsolved' && challenge.is_solved) return false
    if (filters.category !== 'all' && challenge.category !== filters.category) return false
    if (filters.difficulty !== 'all' && challenge.difficulty !== filters.difficulty) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const titleMatch = challenge.title.toLowerCase().includes(searchLower)
      const desc = typeof challenge.description === 'string' ? challenge.description : ''
      const descMatch = desc.toLowerCase().includes(searchLower)
      if (!titleMatch && !descMatch) return false
    }
    return true
  })

  const preferredOrder = APP.challengeCategories || []
  const allCategories = Array.from(new Set(challenges.map(c => c.category))).filter(Boolean) as string[]
  const categories = buildFuzzyOrderedList(preferredOrder, allCategories)
  const difficulties = Array.from(new Set(challenges.map(c => c.difficulty))).sort()
  const sortedFilteredChallenges = sortMode === 'newest' ? sortChallengesByNewest(filteredChallenges) : sortChallengesByDisplayPriority(filteredChallenges, difficultyOrder)
  const grouped = groupChallengesByCategory(sortedFilteredChallenges)
  const orderedKeys = buildFuzzyOrderedList(preferredOrder, Object.keys(grouped))

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

  const enrichedEvents = events.map(e => {
    const isGlobalAdmin = isGlobalAdminUser
    const isEventAdmin = eventAdminIds.includes(e.id)
    const canBypass = isGlobalAdmin || isEventAdmin
    const m = eventMembershipCache.get(e.id)
    const isLocked = !allMembershipsLoaded ? false : (!canBypass && e.join_mode !== 'open' && !m?.is_member)
    return { ...e, isLocked }
  })

  const selectedSubChallengeState = selectedChallenge ? getSubChallengeState(selectedChallenge.id) : null
  const selectedSubChallengeAnswers = selectedChallenge ? getSubChallengeAnswers(selectedChallenge.id) : {}

  return {
    user,
    loading,
    currentTab,
    setCurrentTab,
    challengeTab,
    setChallengeTab,
    solvers,
    flagInputs,
    flagFeedback,
    submitting,
    placeholders,
    showHintModal,
    setShowHintModal,
    downloading,
    selectedChallenge,
    filters,
    setFilters,
    layoutMode,
    sortMode,
    setSortMode,
    events,
    setSelectedEvent,
    eventId,
    filterSettings,
    setFilterSettings,
    eventMembership,
    setEventMembership,
    eventMembershipLoading,
    targetEventId,
    setTargetEventId,
    targetEventMembership,
    setTargetEventMembership,
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    isChallengesLoading,
    initialLoading,
    allMembershipsLoaded,
    selectedEventObj,
    nowDate,
    selectedEventStart,
    selectedEventNotStarted,
    selectedEventEnded,
    handleTabChange,
    openChallenge,
    closeChallenge,
    handleFlagSubmit,
    handleFlagInputChange,
    handleSubChallengeAnswerChange,
    handleSubChallengeSubmit,
    attemptEventSelect,
    eventJoinBlocked,
    filteredChallenges,
    challenges,
    categories,
    difficulties,
    sortedFilteredChallenges,
    grouped,
    orderedKeys,
    downloadFile,
    enrichedEvents,
    selectedSubChallengeState,
    selectedSubChallengeAnswers,
    resetSubChallengeAnswers,
    getCachedEventMembership,
    formatRemaining,
  }
}
