'use client'

import React, { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import APP from '@/config'
import { Loader } from '@/shared/components/custom'
import { useUserProfile } from '../../hooks/useUserProfile'
import { UserProfileProps } from '../../types'
import { getUserBadges } from '../../lib/badge-utils'

import ProfileTabs from './ProfileTabs'
import ProfileHeader from './ProfileHeader'
import StatsGrid from './StatsGrid'
import ProgressSection from './ProgressSection'
import SolvedChallenges from './SolvedChallenges'
import UnsolvedChallengesModal from './UnsolvedChallengesModal'
import UserStatsPlotly from './UserStats'
import { UserEmptyState } from '../ui'

export default function UserProfile({
  userId,
  loading,
  error,
  onBack,
  isCurrentUser = false,
}: UserProfileProps) {
  const {
    userDetail,
    setUserDetail,
    loadingDetail,
    initialLoading,
    activeTab,
    setActiveTab,
    profileEvents,
    effectiveSelectedEvent,
    setSelectedEvent,
    showMainOption,
    solvedChallenges,
    firstBloodIds,
    categoryTotals,
    difficultyTotals,
    teamInfo,
    authInfo,
    showAllModal,
    setShowAllModal,
    showUnsolvedModal,
    setShowUnsolvedModal,
    unsolvedChallenges,
    loadingUnsolved,
    handleShowUnsolved,
    refreshUserDetail,
  } = useUserProfile(userId, isCurrentUser)

  const hasError = error || !userDetail
  const avatarSrc = userDetail?.profile_picture_url || userDetail?.picture || null

  const completedCategoryCount = useMemo(() => {
    return categoryTotals.reduce((count, { category, total_challenges }) => {
      if (!total_challenges) return count
      const solvedInCategory = solvedChallenges.filter(c => c.category === category).length
      return solvedInCategory >= total_challenges ? count + 1 : count
    }, 0)
  }, [categoryTotals, solvedChallenges])

  const badges = useMemo(() => {
    return (userDetail && (solvedChallenges.length > 0 || firstBloodIds.length > 0 || (userDetail.rank && userDetail.rank > 0)))
      ? getUserBadges(userDetail.rank, firstBloodIds.length, solvedChallenges.length, completedCategoryCount)
      : []
  }, [userDetail, solvedChallenges, firstBloodIds, completedCategoryCount])

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader color="text-blue-500" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-gray-900 selection:bg-blue-500/30 dark:bg-[#0b0f19] dark:text-gray-100">
        <ProfileBackground />
        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center justify-center px-6 py-16">
          <UserEmptyState
            icon={AlertTriangle}
            title={error || 'User not found'}
            description={isCurrentUser ? 'Failed to load your profile.' : 'User not found.'}
            action={onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400"
              >
                Go Back
              </button>
            ) : null}
            className="w-full max-w-md"
          />
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-gray-900 selection:bg-blue-500/30 dark:bg-[#0b0f19] dark:text-gray-100">
      <ProfileBackground />
      <main className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        {loading || loadingDetail ? (
          <div className="flex justify-center py-4 opacity-70">
            <Loader color="text-blue-500" />
          </div>
        ) : null}

        {userDetail && (
          <>
            <ProfileHeader
              userDetail={userDetail}
              avatarSrc={avatarSrc}
              badges={badges}
              effectiveSelectedEvent={effectiveSelectedEvent}
              setSelectedEvent={setSelectedEvent}
              profileEvents={profileEvents}
              showMainOption={showMainOption}
              isCurrentUser={isCurrentUser}
              authInfo={authInfo}
              refreshUserDetail={refreshUserDetail}
              onUpdateUserDetail={setUserDetail}
            />

            <StatsGrid
              userDetail={userDetail}
              solvedChallengesCount={solvedChallenges.length}
              firstBloodCount={firstBloodIds.length}
              teamInfo={teamInfo}
            />
          </>
        )}

        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBack={onBack}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div
              key="profile-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <ProgressSection
                categoryTotals={categoryTotals}
                difficultyTotals={difficultyTotals}
                solvedChallenges={solvedChallenges}
              />

              <SolvedChallenges
                solvedChallenges={solvedChallenges}
                firstBloodIds={firstBloodIds}
                showAllModal={showAllModal}
                setShowAllModal={setShowAllModal}
                onShowUnsolved={handleShowUnsolved}
              />
            </motion.div>
          ) : (
            <motion.div
              key="stats-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <UserStatsPlotly
                solvedChallenges={solvedChallenges}
                firstBloodIds={firstBloodIds}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <UnsolvedChallengesModal
          open={showUnsolvedModal}
          onOpenChange={setShowUnsolvedModal}
          loading={loadingUnsolved}
          unsolvedChallenges={unsolvedChallenges}
        />
      </main>
    </div>
  )
}

function ProfileBackground() {
  const watermarkSrc = APP.nxctf?.nxctf_logo || APP.image_logo

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>
      {watermarkSrc && (
        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={watermarkSrc}
            alt=""
            aria-hidden="true"
            className="h-auto w-[min(72vw,720px)] select-none object-contain"
          />
        </div>
      )}
    </>
  )
}
