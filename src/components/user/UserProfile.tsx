"use client"

import { ChallengeWithSolve } from '@/types'
import { getFirstBloodChallengeIds, getChallenges } from '@/lib/challenges'
import { useEffect, useState, Fragment } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_CONTENT_CLASS_3XL } from "@/styles/dialog"
import { getUserDetail, getCategoryTotals, getDifficultyTotals } from '@/lib/users'
import { getEvents, filterStartedEvents } from '@/lib/events'
import { Event } from '@/types'
import { getTeamByUserId } from '@/lib/teams'
import { formatRelativeDate } from '@/lib/utils'
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { Award, Crown, Droplet, Flame, CheckCircle2, LayoutGrid, Grid2X2, Grid3X3, Layers, Medal, ShieldCheck, Swords, Target, Trophy, Zap, Users, ChartColumnDecreasing } from 'lucide-react'
import ImageWithFallback from '../ImageWithFallback'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EditProfileModal from './EditProfileModal'
import { getCurrentAuthInfo, getCurrentUser } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import SocialIcon from '../custom/SocialIcon'
import Loader from '@/components/custom/loading'
import BackButton from '../custom/BackButton'
import DifficultyBadge from '../custom/DifficultyBadge'
import APP from '@/config'
import UserStatsPlotly from './UserStats'

type UserDetail = {
  id: string
  username: string
  rank: number | null
  score: number
  picture?: string | null
  profile_picture_url?: string | null
  bio?: string | null
  sosmed?: {
    linkedin?: string
    instagram?: string
    discord?: string
    web?: string
    [key: string]: string | undefined
  } | null
  created_at?: string | null
  last_login_at?: string | null
  solved_challenges: ChallengeWithSolve[]
}

type Props = {
  userId: string | null
  loading: boolean
  error?: string | null
  onBack?: () => void
  isCurrentUser?: boolean
}

// Badge type
type Badge = {
  label: string;
  color: string;
  icon: JSX.Element;
};

function getUserBadges(rank: number | null, firstBloodCount: number, solvedCount: number, completedCategoryCount: number): Badge[] {
  const badges: Badge[] = [];
  // Rank badges: only show if rank is a positive number AND user has at least one solve
  if (typeof rank === 'number' && rank > 0 && solvedCount > 0) {
    if (rank === 1) {
      badges.push({ label: 'Top 1', color: 'bg-yellow-400 text-yellow-900 border-yellow-500', icon: <Crown className="h-3.5 w-3.5" /> });
    } else if (rank <= 3) {
      badges.push({ label: 'Top 3', color: 'bg-yellow-300 text-yellow-900 border-yellow-400', icon: <Trophy className="h-3.5 w-3.5" /> });
    } else if (rank <= 10) {
      badges.push({ label: 'Top 10', color: 'bg-yellow-200 text-yellow-900 border-yellow-300', icon: <Medal className="h-3.5 w-3.5" /> });
    } else if (rank <= 25) {
      badges.push({ label: 'Top 25', color: 'bg-yellow-100 text-yellow-900 border-yellow-200', icon: <Award className="h-3.5 w-3.5" /> });
    } else if (rank <= 50) {
      badges.push({ label: 'Top 50', color: 'bg-yellow-50 text-yellow-900 border-yellow-100', icon: <ShieldCheck className="h-3.5 w-3.5" /> });
    }
  }

  // First Blood (show only the highest tier)
  if (firstBloodCount >= 10) {
    badges.push({ label: 'King of First Bloods', color: 'bg-pink-200 text-pink-900 border-pink-400', icon: <Crown className="h-3.5 w-3.5" /> });
  } else if (firstBloodCount >= 5) {
    badges.push({ label: '5+ First Bloods', color: 'bg-red-200 text-red-800 border-red-400', icon: <Droplet className="h-3.5 w-3.5" /> });
  } else if (firstBloodCount >= 1) {
    badges.push({ label: 'First Blood', color: 'bg-red-100 text-red-700 border-red-200', icon: <Zap className="h-3.5 w-3.5" /> });
  }

  // Solved
  if (solvedCount >= 100) badges.push({ label: '100+ Solves', color: 'bg-green-700 text-white border-green-800', icon: <Swords className="h-3.5 w-3.5" /> });
  else if (solvedCount >= 50) badges.push({ label: '50+ Solves', color: 'bg-green-600 text-white border-green-700', icon: <Trophy className="h-3.5 w-3.5" /> });
  else if (solvedCount >= 25) badges.push({ label: '25+ Solves', color: 'bg-green-500 text-white border-green-600', icon: <Target className="h-3.5 w-3.5" /> });
  else if (solvedCount >= 10) badges.push({ label: '10+ Solves', color: 'bg-green-400 text-white border-green-500', icon: <Flame className="h-3.5 w-3.5" /> });

  // Category completion (show only the highest tier)
  if (completedCategoryCount >= 10) {
    badges.push({ label: '10+ Categories', color: 'bg-blue-700 text-white border-blue-800', icon: <LayoutGrid className="h-3.5 w-3.5" /> });
  } else if (completedCategoryCount >= 5) {
    badges.push({ label: '5+ Categories', color: 'bg-blue-600 text-white border-blue-700', icon: <Grid3X3 className="h-3.5 w-3.5" /> });
  } else if (completedCategoryCount >= 3) {
    badges.push({ label: '3+ Categories', color: 'bg-blue-500 text-white border-blue-600', icon: <Grid2X2 className="h-3.5 w-3.5" /> });
  } else if (completedCategoryCount >= 1) {
    badges.push({ label: 'Category Finisher', color: 'bg-blue-400 text-white border-blue-500', icon: <Layers className="h-3.5 w-3.5" /> });
  }

  return badges;
}

export default function UserProfile({
  userId,
  loading,
  error,
  onBack,
  isCurrentUser = false,
}: Props) {
  const router = useRouter()
  const { setUser } = useAuth()
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [firstBloodIds, setFirstBloodIds] = useState<string[]>([])
  const [categoryTotals, setCategoryTotals] = useState<{ category: string; total_challenges: number }[]>([])
  const [difficultyTotals, setDifficultyTotals] = useState<{ difficulty: string; total_challenges: number }[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventMode, setSelectedEventMode] = useState<'any'|'equals'|'is_null'>('any')
  const [selectedEvent, setSelectedEvent] = useState<string>(() =>
    selectedEventMode === 'equals' ? (selectedEventId ?? '') : selectedEventMode === 'is_null' ? 'main' : 'all'
  )
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true)
  const [showAllModal, setShowAllModal] = useState(false)
  const [showUnsolvedModal, setShowUnsolvedModal] = useState(false)
  const [unsolvedChallenges, setUnsolvedChallenges] = useState<any[]>([])
  const [loadingUnsolved, setLoadingUnsolved] = useState(false)
  const [authInfo, setAuthInfo] = useState<Array<{ provider: string; email: string }>>([])
  const [teamInfo, setTeamInfo] = useState<{ team: any; members: any[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile')

  const refreshUserDetail = async () => {
    if (!userId) return
    try {
      const detail = await getUserDetail(
        userId,
        selectedEventMode === 'equals' ? selectedEventId : null,
        selectedEventMode
      )
      setUserDetail(detail)
      if (isCurrentUser) {
        const freshUser = await getCurrentUser()
        if (freshUser) setUser(freshUser)
      }
    } catch (err) {
      console.error('Error refreshing user detail:', err)
    }
  }

  useEffect(() => {
    if (isCurrentUser) {
      getCurrentAuthInfo().then(setAuthInfo)
    }
  }, [isCurrentUser])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!userId) return
      setLoadingDetail(true)
      try {
        const detail = await getUserDetail(
          userId,
          selectedEventMode === 'equals' ? selectedEventId : null,
          selectedEventMode
        )
        setUserDetail(detail)

        if (detail) {
          const firstBlood = await getFirstBloodChallengeIds(detail.id)
          const solvedIds = new Set((detail.solved_challenges || []).map(c => c.id))
          setFirstBloodIds(firstBlood.filter(id => solvedIds.has(id)))

          const totals = await getCategoryTotals(
            selectedEventMode === 'equals' ? selectedEventId : null,
            selectedEventMode
          )
          setCategoryTotals(totals)

          const diffTotals = await getDifficultyTotals(
            selectedEventMode === 'equals' ? selectedEventId : null,
            selectedEventMode
          )
          setDifficultyTotals(diffTotals)

          if (APP.teams.enabled) {
            const { team, members } = await getTeamByUserId(detail.id)
            if (team) setTeamInfo({ team, members })
            else setTeamInfo(null)
          }
        }
      } finally {
        setLoadingDetail(false)
      }
    }
    fetchDetail()
  }, [userId, selectedEventId, selectedEventMode])

  // Load events list once
  useEffect(() => {
    if (events.length > 0) return
    getEvents()
      .then(ev => setEvents(filterStartedEvents(ev || [])))
      .catch(() => setEvents([]))
  }, [])

  // Sync scoreboard-style `selectedEvent` with internal mode/id used for fetching
  useEffect(() => {
    if (selectedEvent === 'all') {
      setSelectedEventMode('any')
      setSelectedEventId(null)
    } else if (selectedEvent === 'main') {
      setSelectedEventMode('is_null')
      setSelectedEventId(null)
    } else {
      setSelectedEventMode('equals')
      setSelectedEventId(selectedEvent)
    }
  }, [selectedEvent])

  const isLoading = loading || loadingDetail
  const hasError = error || !userDetail
  const solvedChallenges = userDetail?.solved_challenges || []
  const avatarSrc = userDetail?.profile_picture_url || userDetail?.picture || null
  const completedCategoryCount = categoryTotals.reduce((count, { category, total_challenges }) => {
    if (!total_challenges) return count
    const solvedInCategory = solvedChallenges.filter(c => c.category === category).length
    return solvedInCategory >= total_challenges ? count + 1 : count
  }, 0)

  // Only compute badges when there's meaningful activity (solves, first-bloods, or a positive rank)
  const badges = (userDetail && (solvedChallenges.length > 0 || firstBloodIds.length > 0 || (userDetail.rank && userDetail.rank > 0)))
    ? getUserBadges(userDetail.rank, firstBloodIds.length, solvedChallenges.length, completedCategoryCount)
    : []

  // Fetch unsolved challenges when modal is opened
  const handleShowUnsolved = async () => {
    setShowUnsolvedModal(true)
    setLoadingUnsolved(true)
    try {
      const challengeEventParam = selectedEventMode === 'any' ? 'all' : (selectedEventMode === 'equals' ? selectedEventId : null)
      const allChallenges = await getChallenges(userId || undefined, false, challengeEventParam)
      const solvedIds = new Set(solvedChallenges.map(c => c.id))
      const unsolved = allChallenges.filter(c => !solvedIds.has(c.id))
      setUnsolvedChallenges(unsolved)
    } catch (err) {
      console.error('Error fetching unsolved challenges:', err)
    } finally {
      setLoadingUnsolved(false)
    }
  }

  // Group unsolved challenges by category
  const unsolvedByCategory = unsolvedChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = []
    }
    acc[challenge.category].push(challenge)
    return acc
  }, {} as Record<string, any[]>)

  // Get preferred order from config
  const preferredOrder = (typeof APP !== 'undefined' && APP.challengeCategories) ? APP.challengeCategories : [];
  // Get all categories from unsolvedByCategory
  const unsolvedCategories = Object.keys(unsolvedByCategory);
  // Build ordered categories: preferred first, then the rest
  const matchedCategorySet = new Set<string>();
  const orderedUnsolvedCategories = [
    ...preferredOrder.flatMap(p => {
      const pLower = p.toLowerCase();
      const found = unsolvedCategories.find(c => {
        const cLower = c.toLowerCase();
        return cLower.includes(pLower) || pLower.includes(cLower);
      });
      if (found && !matchedCategorySet.has(found)) {
        matchedCategorySet.add(found);
        return found;
      }
      return [] as string[];
    }),
    ...unsolvedCategories.filter(c => !matchedCategorySet.has(c)).sort()
  ];

  // Username truncation handled by Tailwind utility classes below

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Kondisi: Loader */}
        {isLoading && (
          <Loader fullscreen color="text-orange-500" />
        )}

        {/* Kondisi: Error */}
        {!isLoading && hasError && (
          <div className="max-w-4xl mx-auto py-16 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-400 dark:text-red-300">❌</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {error || 'User not found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {isCurrentUser
                ? 'Failed to load your profile.'
                : "The user you are looking for doesn’t exist or has been removed."}
            </p>
            {onBack && <BackButton onClick={onBack} label="Go Back" />}
          </div>
        )}

        {/* Kondisi: Data */}
        {!isLoading && !hasError && userDetail && (
          <>
            {/* Tabs */}
            <div className="mb-4 flex justify-between items-center">
              {/* Back Button */}
              {onBack && (
                <BackButton onClick={onBack} label="Go Back" />
              )}
              {/* (Event selector moved below EditProfileModal) */}
              <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    Profile
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ChartColumnDecreasing size={16} />
                    Stats
                  </div>
                </button>
              </span>
            </div>

            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 py-6">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
                    <ImageWithFallback src={avatarSrc} alt={userDetail.username} size={80} className="max-h-full rounded-full border border-gray-200 dark:border-gray-700" fallbackBg="bg-blue-100 dark:bg-blue-900" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate whitespace-nowrap max-w-[160px] sm:max-w-xs block" title={userDetail.username}>
                      {userDetail.username}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Score: <span className="font-semibold text-orange-600 dark:text-orange-400">{userDetail.score}</span></p>
                    {/* BADGES */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {badges.map((badge, idx) => (
                        <span
                          key={badge.label + idx}
                          className={`inline-flex items-center border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded-md text-xs font-medium shadow-sm ${badge.color} transition-all duration-150 hover:scale-105`}
                          style={{ lineHeight: '1.2', minWidth: 0 }}
                        >
                          <span className="mr-1 text-base" style={{fontSize:'1em'}}>{badge.icon}</span>
                          <span className="truncate max-w-[100px]">{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto md:items-end order-3 md:order-none">
                    {/* Scoreboard-style Event selector (placed below EditProfileModal) */}
                    <div className="w-full md:w-auto">
                      <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full md:min-w-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                      >
                        {!APP.hideEventMain && <option value="main">{String(APP.eventMainLabel || 'Main')}</option>}
                        <option value="all">All Events</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>{(ev as any).name ?? (ev as any).title ?? 'Untitled'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Email & Providers info moved to EditProfileModal */}
                    {isCurrentUser && userDetail && (
                      <EditProfileModal
                        userId={userDetail.id}
                        currentUsername={userDetail.username}
                        currentBio={userDetail.bio || ''}
                        currentProfilePictureUrl={userDetail.profile_picture_url || ''}
                        currentSosmed={userDetail.sosmed || {}}
                        onUsernameChange={username => setUserDetail({ ...userDetail, username })}
                        onProfileChange={({ username, bio, sosmed, profile_picture_url }) => {
                          const nextProfileUrl = profile_picture_url ?? userDetail.profile_picture_url ?? null
                          const isGooglePicture = !!userDetail.picture && userDetail.picture !== userDetail.profile_picture_url
                          const nextPicture = isGooglePicture
                            ? userDetail.picture
                            : (nextProfileUrl || null)
                          setUserDetail({
                            ...userDetail,
                            username,
                            bio,
                            sosmed,
                            profile_picture_url: nextProfileUrl,
                            picture: nextPicture,
                          })
                        }}
                        onSaved={refreshUserDetail}
                        triggerButtonClass="w-full md:min-w-[150px] bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-400 border-none shadow"
                        authInfo={authInfo}
                      />
                    )}
                  </div>
                </CardContent>
                <CardContent className="pt-0 pb-1 px-8">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Joined: {userDetail.created_at ? formatRelativeDate(userDetail.created_at) : '-'} |
                    Last login: {userDetail.last_login_at ? formatRelativeDate(userDetail.last_login_at) : 'Never'}
                  </p>
                </CardContent>
                {/* Bio and Sosmed below header - new style */}
                {(userDetail.bio?.trim() || userDetail.sosmed) && (
                  <CardContent className="pt-0 pb-4 px-8">
                    {/* Bio */}
                    {userDetail.bio?.trim() && (
                      <p className="text-sm text-gray-700 dark:text-gray-200 mb-2 break-words border-b border-gray-200 dark:border-gray-700 pb-2">
                        {userDetail.bio}
                      </p>
                    )}
                    {/* Sosmed */}
                    {userDetail.sosmed && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* LinkedIn */}
                        {userDetail.sosmed.linkedin?.trim() && (
                          <SocialIcon
                            type="linkedin"
                            href={userDetail.sosmed.linkedin.startsWith('http')
                              ? userDetail.sosmed.linkedin
                              : `https://linkedin.com/in/${userDetail.sosmed.linkedin}`}
                            label="LinkedIn"
                            hideLabelOnMobile
                          />
                        )}
                        {/* Instagram */}
                        {userDetail.sosmed.instagram?.trim() && (
                          <SocialIcon
                            type="instagram"
                            href={userDetail.sosmed.instagram.startsWith('http')
                              ? userDetail.sosmed.instagram
                              : `https://instagram.com/${userDetail.sosmed.instagram}`}
                            label="Instagram"
                            hideLabelOnMobile
                          />
                        )}
                        {/* Web */}
                        {userDetail.sosmed.web?.trim() && (
                          <SocialIcon
                            type="web"
                            href={userDetail.sosmed.web.startsWith('http')
                              ? userDetail.sosmed.web
                              : `https://${userDetail.sosmed.web}`}
                            label="Website"
                            hideLabelOnMobile
                          />
                        )}
                        {/* Discord (always show label) */}
                        {userDetail.sosmed.discord?.trim() && (
                          <SocialIcon
                            type="discord"
                            label={userDetail.sosmed.discord}
                            alwaysShowLabel
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`grid grid-cols-1 ${APP.teams.enabled && teamInfo ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}
            >
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Rank</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-900 dark:to-yellow-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-yellow-300/60 dark:ring-yellow-800/60">
                    <Crown className="h-5 w-5 text-yellow-800 dark:text-yellow-200" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(!userDetail.rank || solvedChallenges.length === 0) ? '-' : `#${userDetail.rank}`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Solved</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-green-300/60 dark:ring-green-800/60">
                    <CheckCircle2 className="h-5 w-5 text-green-800 dark:text-green-200" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{solvedChallenges.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">First Bloods</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-red-200 to-red-400 dark:from-red-900 dark:to-red-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-red-300/60 dark:ring-red-800/60">
                    <Droplet className="h-5 w-5 text-red-800 dark:text-red-200" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{firstBloodIds.length}</p>
                </CardContent>
              </Card>

              {/* Team Info */}
              {APP.teams.enabled && teamInfo && (
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Team</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-200 to-purple-400 dark:from-purple-900 dark:to-purple-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-purple-300/60 dark:ring-purple-800/60">
                      <Users className="h-5 w-5 text-purple-800 dark:text-purple-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xl font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        title={teamInfo.team.name}
                        onClick={() => router.push(`/teams/${encodeURIComponent(teamInfo.team.name)}`)}
                      >
                        {teamInfo.team.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {teamInfo.members.length} member{teamInfo.members.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {activeTab === 'profile' && (
            <>

            {/* Category Progress */}
            {categoryTotals.map(({ category, total_challenges }) => {
              const solvedInCategory = solvedChallenges.filter(c => c.category === category)
              if (solvedInCategory.length === 0) return null

              const progress =
                total_challenges > 0
                  ? (solvedInCategory.length / total_challenges) * 100
                  : 0

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300">
                      {solvedInCategory.length}/{total_challenges}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })}

            {/* Difficulty Progress Bar */}
            {(() => {
              // Check if user has solved at least 1 challenge
              const hasSolvedAny = difficultyTotals.some(({ difficulty }) => {
                const solvedInDifficulty = solvedChallenges.filter(c => c.difficulty === difficulty)
                return solvedInDifficulty.length > 0
              })

              if (!hasSolvedAny) return null

              // Filter difficulties that have challenges and user has made progress
              let activeDifficulties = difficultyTotals.filter(({ difficulty, total_challenges }) => {
                const solvedCount = solvedChallenges.filter(c => c.difficulty === difficulty).length
                return total_challenges > 0 && solvedCount > 0
              })

              if (activeDifficulties.length === 0) return null

              // Sort difficulties based on config.ts order (priority: Baby, Easy, Medium, Hard, Impossible, then others)
              const difficultyOrder = Object.keys(APP.difficultyStyles).map(k => k.toLowerCase())
              activeDifficulties = activeDifficulties.sort((a, b) => {
                const aIndex = difficultyOrder.indexOf(a.difficulty.toLowerCase())
                const bIndex = difficultyOrder.indexOf(b.difficulty.toLowerCase())

                // If both in config, use config order
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                // If only a in config, a comes first
                if (aIndex !== -1) return -1
                // If only b in config, b comes first
                if (bIndex !== -1) return 1
                // Both not in config, alphabetical order
                return a.difficulty.localeCompare(b.difficulty)
              })

              // Calculate overall progress across difficulties
              const totalChallenges = activeDifficulties.reduce((sum, d) => sum + d.total_challenges, 0)
              const totalSolved = activeDifficulties.reduce((sum, { difficulty }) => {
                return sum + solvedChallenges.filter(c => c.difficulty === difficulty).length
              }, 0)

              // Color mapping from config.difficultyStyles
              const colorMap: Record<string, string> = {
                'cyan': 'bg-cyan-500 dark:bg-cyan-400',
                'green': 'bg-green-500 dark:bg-green-400',
                'yellow': 'bg-yellow-500 dark:bg-yellow-400',
                'red': 'bg-red-500 dark:bg-red-400',
                'purple': 'bg-purple-500 dark:bg-purple-400',
                'blue': 'bg-blue-500 dark:bg-blue-400',
                'orange': 'bg-orange-500 dark:bg-orange-400',
                'pink': 'bg-pink-500 dark:bg-pink-400',
              }

              // Get difficulty styles from APP config (normalize keys to lowercase)
              const difficultyStylesConfig: Record<string, string> = {}
              Object.entries(APP.difficultyStyles).forEach(([key, value]) => {
                difficultyStylesConfig[key.toLowerCase()] = value.toLowerCase()
              })

              // Map each difficulty to its color from config
              const difficultyColors: Record<string, string> = {}
              activeDifficulties.forEach(({ difficulty }) => {
                const normalizedDiff = difficulty.toLowerCase()
                const colorName = difficultyStylesConfig[normalizedDiff] || 'gray'
                difficultyColors[difficulty] = colorMap[colorName] || 'bg-gray-500 dark:bg-gray-400'
              })

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Difficulty Progress</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300">
                      {totalSolved}/{totalChallenges}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex overflow-hidden">
                    {activeDifficulties.map(({ difficulty, total_challenges }) => {
                      const solvedInDifficulty = solvedChallenges.filter(c => c.difficulty === difficulty)
                      const segmentWidth = (total_challenges / totalChallenges) * 100
                      const segmentProgress = (solvedInDifficulty.length / total_challenges) * 100
                      const colorClass = difficultyColors[difficulty] || 'bg-gray-500 dark:bg-gray-400'

                      return (
                        <div
                          key={difficulty}
                          className="relative"
                          style={{ width: `${segmentWidth}%` }}
                          title={`${difficulty}: ${solvedInDifficulty.length}/${total_challenges}`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${segmentProgress}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`h-3 ${colorClass}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeDifficulties.map(({ difficulty, total_challenges }) => {
                      const solvedInDifficulty = solvedChallenges.filter(c => c.difficulty === difficulty)
                      const colorClass = difficultyColors[difficulty] || 'bg-gray-500 dark:bg-gray-400'
                      return (
                        <span
                          key={difficulty}
                          className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
                        >
                          <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                          <span className="capitalize">{difficulty}</span>
                          <span>({solvedInDifficulty.length}/{total_challenges})</span>
                        </span>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })()}

            {/* Recent Solved Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white">Recent Solved Challenges</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleShowUnsolved}>
                        Show Unsolved
                      </Button>
                      {solvedChallenges.length > 10 && (
                        <Button size="sm" variant="outline" onClick={() => setShowAllModal(true)}>
                          Show All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {solvedChallenges.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No solved challenges yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {solvedChallenges.slice(0, 10).map((challenge) => (
                          <motion.div
                            key={challenge.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {challenge.title}
                                {firstBloodIds.includes(challenge.id) && (
                                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                    First Blood
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-300">
                                {challenge.category} • {challenge.difficulty} • {challenge.solved_at ? formatRelativeDate(challenge.solved_at) : '-'}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-300">
                              +{challenge.points}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            </motion.div>

            {/* Modal Show All Solved Challenges (Compact Clean Version) */}
            <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
              <DialogContent className={DIALOG_CONTENT_CLASS_3XL + " fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    All Solved Challenges
                  </DialogTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAllModal(false)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    ✕
                  </Button>
                </div>

                {/* Body */}
                <div className="p-0">
                  {solvedChallenges.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No solved challenges yet
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[70vh] divide-y divide-gray-200 dark:divide-gray-700 scroll-hidden">
                      {solvedChallenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3"
                        >
                          {/* Left */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {challenge.title}
                              </span>
                              {firstBloodIds.includes(challenge.id) && (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                  🩸 First Blood
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {challenge.category} • {challenge.difficulty} • {challenge.solved_at ? formatRelativeDate(challenge.solved_at) : '-'}
                            </p>
                          </div>

                          {/* Right */}
                          <span className="text-sm font-semibold text-green-600 dark:text-green-300 whitespace-nowrap">
                            +{challenge.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal Show Unsolved Challenges (Grouped by Category) */}
            <Dialog open={showUnsolvedModal} onOpenChange={setShowUnsolvedModal}>
              <DialogContent className={DIALOG_CONTENT_CLASS_3XL + " fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Unsolved Challenges
                  </DialogTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowUnsolvedModal(false)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    ✕
                  </Button>
                </div>

                {/* Body */}
                <div className="p-0">
                  {loadingUnsolved ? (
                    <div className="flex justify-center py-12">
                      <Loader color="text-orange-500" />
                    </div>
                  ) : unsolvedChallenges.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      🎉 All challenges completed!
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[70vh] divide-y divide-gray-200 dark:divide-gray-700 scroll-hidden">
                      {orderedUnsolvedCategories.map(category => {
                        const challengeList = unsolvedByCategory[category] as any[];
                        return (
                          <div key={category} className="px-6 py-4">
                            {/* Category Header */}
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">
                                {category}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({challengeList.length} {challengeList.length === 1 ? 'challenge' : 'challenges'})
                              </span>
                            </h3>

                            {/* Challenge List */}
                            <div className="space-y-2">
                              {challengeList.map((challenge: any) => (
                                <div
                                  key={challenge.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {challenge.title}
                                      </span>
                                      <DifficultyBadge difficulty={challenge.difficulty} />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {challenge.points} pts • {challenge.total_solves || 0} solves
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </DialogContent>
              </Dialog>
              </>
            )}
            {activeTab === 'stats' && (
              <div>
                <UserStatsPlotly
                  solvedChallenges={solvedChallenges}
                  firstBloodIds={firstBloodIds}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
