'use client'

import { motion } from 'framer-motion'
import { Flag, Zap, Search, CalendarClock, CalendarX, CircleAlert } from 'lucide-react'
import APP from '@/config'
import { ImageWithFallback, Loader } from '@/shared/components'
import ChallengeCard from './ChallengeCard'
import ChallengeDetailDialog from './ChallengeDetailDialog'
import ChallengeFilterBar from './ChallengeFilterBar'
import EventsTab from './EventsTab'
import JoinEventDialog from './JoinEventDialog'
import { useChallengesPageData } from '../hooks/useChallengesPageData'

export default function ChallengesPage() {
  const {
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
    eventMembershipLoading,
    targetEventId,
    targetEventMembership,
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    initialLoading,
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
    setTargetEventMembership,
    setTargetEventId,
    setEventMembership,
  } = useChallengesPageData()

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentTab('challenges')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${currentTab === 'challenges'
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
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${currentTab === 'events'
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

        <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.08] dark:opacity-[0.06] z-0">
          <ImageWithFallback
            src={APP.image_icon}
            alt={`${APP.shortName} watermark`}
            size={720}
            className="rounded-[3rem]"
          />
        </div>

        {currentTab === 'challenges' && (
          <>
            <ChallengeFilterBar
              filters={filters}
              events={enrichedEvents}
              selectedEventId={eventId}
              onEventChange={attemptEventSelect}
              sortMode={sortMode}
              onSortModeChange={() => setSortMode(prev => prev === 'default' ? 'newest' : 'default')}
              hideMainEventOption={APP.hideEventMain}
              settings={filterSettings}
              categories={categories}
              difficulties={difficulties}
              onFilterChange={setFilters}
              onSettingsChange={setFilterSettings}
              onClear={() => setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '', feature: 'N' })}
            />

            <div>
              {initialLoading ? (
                <div className="flex justify-center py-16">
                  <Loader color="text-orange-500" />
                </div>
              ) : eventMembershipLoading && eventMembership?.event_id !== eventId ? (
                <div className="flex justify-center py-10">
                  <Loader color="text-orange-500" />
                </div>
              ) : eventJoinBlocked ? (
                <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
                  Challenge dikunci sampai kamu join event.
                </div>
              ) : (
                filteredChallenges.length === 0 ? (
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
                          {challenges.length === 0 ? 'No challenges available' : 'No challenges match your filters'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {challenges.length === 0 ? 'Check back later for new challenges' : 'Try adjusting your filter criteria'}
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
                    {sortedFilteredChallenges.map((challenge) => (
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

        {currentTab === 'events' && (
          <EventsTab
            events={enrichedEvents}
            selectedEventId={eventId}
            onEventSelect={attemptEventSelect}
          />
        )}
      </div>

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
              setTargetEventMembership(null)
              setTargetEventId(null)
            }}
          />

          <ChallengeDetailDialog
            open={!!selectedChallenge}
            challenge={selectedChallenge}
            solvers={solvers}
            challengeTab={challengeTab}
            showQuestionTab={!!selectedSubChallengeState?.hasQuestions}
            setChallengeTab={(tab) => {
              if ((tab === 'solvers' || tab === 'question') && selectedChallenge) {
                handleTabChange(tab, selectedChallenge.id)
              } else {
                setChallengeTab(tab)
              }
            }}
            onClose={() => {
              closeChallenge()
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
            subChallengeLoaded={!!selectedSubChallengeState?.loaded}
            subChallengeLoading={!!selectedSubChallengeState?.loading}
            subChallengeSubmitting={!!selectedSubChallengeState?.submitting}
            subChallengeMode={selectedSubChallengeState?.mode || 'none'}
            subChallengeQuestions={selectedSubChallengeState?.questions || []}
            subChallengeNextQuestion={selectedSubChallengeState?.nextQuestion || null}
            subChallengeAnswers={selectedSubChallengeAnswers}
            subChallengeResults={selectedSubChallengeState?.results || {}}
            subChallengeCompleted={!!selectedSubChallengeState?.completed}
            subChallengeFlag={selectedSubChallengeState?.flag || null}
            subChallengeMessage={selectedSubChallengeState?.message || null}
            placeholders={placeholders}
            services={selectedChallenge?.services || []}
            onSubChallengeAnswerChange={(orderNumber, value) => {
              if (!selectedChallenge) return
              handleSubChallengeAnswerChange(selectedChallenge.id, orderNumber, value)
            }}
            onSubChallengeSubmit={(orderNumber) => {
              if (!selectedChallenge) return
              handleSubChallengeSubmit(selectedChallenge.id, orderNumber)
            }}
            onSubChallengeReset={() => {
              if (!selectedChallenge) return
              resetSubChallengeAnswers(selectedChallenge.id)
            }}
          />
        </>
      )}
    </div>
  )
}
