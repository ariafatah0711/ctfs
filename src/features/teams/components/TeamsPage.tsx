'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Sparkles, ShieldCheck } from 'lucide-react'

import Loader from '@/shared/components/Loader'
import BackButton from '@/shared/components/BackButton'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import PageBackground from '@/shared/components/PageBackground'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/shared/ui'
import {
  PAGE_MAIN_CONTAINER_6XL,
  SURFACE_GLASS_CARD_COMPACT_CLASS,
  SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS,
  SURFACE_GLASS_INPUT_CLASS,
  THEME_PRIMARY_SELECTION_CLASS,
} from '@/shared/styles'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useEventContext } from '@/features/events/contexts/EventContext'

import TeamPageContent from './TeamPageContent'
import { useMyTeam } from '../hooks/useMyTeam'
import { useTeamEvents } from '../hooks/useTeamEvents'
import { TeamMember } from '../types'

export default function TeamsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('Are you sure?')
  const [confirmExpected, setConfirmExpected] = useState<string | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const confirmActionRef = useRef<() => Promise<void> | void>(() => { })

  // First check if user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Get data using hooks
  const [tempSolvedEventIds, setTempSolvedEventIds] = useState<string[]>([])
  const [tempHasMainSolved, setTempHasMainSolved] = useState<boolean>(false)

  const { teamEvents, showMainOption, effectiveSelectedEvent } = useTeamEvents(
    startedEvents,
    tempSolvedEventIds,
    tempHasMainSolved,
    selectedEvent
  )

  const {
    loading,
    busy,
    team,
    members,
    summary,
    challenges,
    solvedEventIds,
    hasMainSolved,
    status,
    setStatus,
    initialLoading,
    canManage,
    handleCreateTeam,
    handleJoinTeam,
    handleLeaveTeam,
    handleDeleteTeam,
    handleRegenerateInvite,
    handleKickMember,
    handleTransferCaptain,
    handleRenameTeam
  } = useMyTeam(user, effectiveSelectedEvent)

  // Sync back solved data to useTeamEvents
  useEffect(() => {
    setTempSolvedEventIds(solvedEventIds)
    setTempHasMainSolved(hasMainSolved)
  }, [solvedEventIds, hasMainSolved])

  // Stable states to prevent DOM swap flicker
  const [stableTeam, setStableTeam] = useState<any>(null)
  const [stableMembers, setStableMembers] = useState<any[]>([])
  const [stableSummary, setStableSummary] = useState<any>(null)
  const [stableChallenges, setStableChallenges] = useState<any[]>([])

  useEffect(() => {
    requestAnimationFrame(() => {
      setStableTeam(team)
      setStableMembers(members)
      setStableSummary(summary)
      setStableChallenges(challenges)
    })
  }, [team, members, summary, challenges])

  const onCreateTeam = async () => {
    await handleCreateTeam(teamName)
    setTeamName('')
  }

  const onJoinTeam = async () => {
    await handleJoinTeam(inviteCode)
    setInviteCode('')
  }

  const onLeaveTeamClick = () => {
    if (!team) return
    setConfirmMessage('Leave this team?')
    setConfirmExpected('leave this team')
    setConfirmInput('')
    confirmActionRef.current = handleLeaveTeam
    setConfirmOpen(true)
  }

  const onDeleteTeamClick = () => {
    if (!team) return
    setConfirmMessage('Delete this team? This cannot be undone.')
    setConfirmExpected('delete this team')
    setConfirmInput('')
    confirmActionRef.current = () => handleDeleteTeam(team.id)
    setConfirmOpen(true)
  }

  const onRegenerateInviteClick = () => {
    if (!team) return
    setConfirmMessage('Regenerate invite code? Old code will be invalid.')
    setConfirmExpected(null)
    setConfirmInput('')
    confirmActionRef.current = () => handleRegenerateInvite(team.id)
    setConfirmOpen(true)
  }

  const onCopyInvite = async () => {
    if (!team?.invite_code) return
    try {
      await navigator.clipboard.writeText(team.invite_code)
      setStatus({ type: 'success', message: 'Invite code copied.' })
    } catch {
      setStatus({ type: 'error', message: 'Failed to copy invite code.' })
    }
  }

  const onKickMemberClick = (member: TeamMember) => {
    if (!team) return
    setConfirmMessage(`Kick ${member.username} from the team?`)
    setConfirmExpected(null)
    setConfirmInput('')
    confirmActionRef.current = () => handleKickMember(team.id, member)
    setConfirmOpen(true)
  }

  const onTransferCaptainClick = (member: TeamMember) => {
    if (!team) return
    setConfirmMessage(`Transfer captain role to ${member.username}? You will become a regular member.`)
    setConfirmExpected('transfer captain')
    setConfirmInput('')
    confirmActionRef.current = () => handleTransferCaptain(team.id, member)
    setConfirmOpen(true)
  }

  const onRenameTeamInternal = (newName: string) => {
    if (!team) return Promise.resolve({ success: false, error: 'No team' })
    return handleRenameTeam(team.id, newName)
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader fullscreen />
      </div>
    )
  }

  if (!user) return null

  return (
    <PageBackground selectionClassName={THEME_PRIMARY_SELECTION_CLASS}>
      <div className={`${PAGE_MAIN_CONTAINER_6XL} space-y-5`}>
        {initialLoading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : (
          <>
            {loading && team && (
              <div className="fixed top-20 right-8 z-50 opacity-70 pointer-events-none">
                <Loader />
              </div>
            )}

            {status && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm border ${status.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/50'
                  }`}
              >
                {status.message}
              </div>
            )}

            {!team ? (
              <div className="grid grid-cols-1 items-start gap-5 pt-2 md:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.75fr)]">
                <div className={`space-y-4 p-5 ${SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}`}>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                      Squad up for the <span className="text-blue-600 dark:text-blue-400">Next Conquest.</span>
                    </h2>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                      Join an existing crew or build your own elite team of hackers. Solve together, win together.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <div className={`flex items-center gap-3 p-3 ${SURFACE_GLASS_CARD_COMPACT_CLASS}`}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Collaboration</p>
                        <p className="text-sm font-bold">Shared Solves</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 ${SURFACE_GLASS_CARD_COMPACT_CLASS}`}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Competition</p>
                        <p className="text-sm font-bold">Team Rank</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className={SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}>
                    <CardHeader>
                      <CardTitle className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-blue-500" /> Start Your Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Team Name</label>
                        <Input
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="CyberKnights, VoidWalkers, etc."
                          disabled={busy}
                          className={SURFACE_GLASS_INPUT_CLASS}
                        />
                      </div>
                      <Button
                        onClick={onCreateTeam}
                        disabled={busy || !teamName.trim()}
                        className="h-11 w-full rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                      >
                        Create Team
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#fafafa] dark:bg-[#0b0f19] px-2 text-gray-500 font-black">Or Join One</span>
                    </div>
                  </div>

                  <Card className={SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}>
                    <CardHeader>
                      <CardTitle className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                        <UserPlus size={18} className="text-emerald-500" /> Enter Invite Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Paste code here..."
                        disabled={busy}
                        className={`${SURFACE_GLASS_INPUT_CLASS} font-mono text-center tracking-widest`}
                      />
                      <Button
                        onClick={onJoinTeam}
                        disabled={busy || !inviteCode.trim()}
                        variant="secondary"
                        className="h-11 w-full rounded-xl font-black uppercase tracking-widest"
                      >
                        Join Team
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <TeamPageContent
                key={effectiveSelectedEvent}
                team={stableTeam || team}
                members={stableMembers.length > 0 ? stableMembers : members}
                summary={stableSummary || summary}
                challenges={stableChallenges.length > 0 ? stableChallenges : challenges}
                currentUserId={user.id}
                canManage={canManage}
                busy={busy}
                showManageActions
                onRenameTeam={onRenameTeamInternal}
                onCopyInvite={onCopyInvite}
                onRegenerateInvite={onRegenerateInviteClick}
                onLeaveTeam={onLeaveTeamClick}
                onDeleteTeam={onDeleteTeamClick}
                onKickMember={onKickMemberClick}
                onTransferCaptain={onTransferCaptainClick}

                effectiveSelectedEvent={effectiveSelectedEvent}
                setSelectedEvent={setSelectedEvent}
                teamEvents={teamEvents as any}
                showMainOption={showMainOption}
                onBack={() => router.back()}
              />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmInput('')
            setConfirmExpected(null)
            setConfirmMessage('Are you sure?')
          }
          setConfirmOpen(open)
        }}
        title="Confirm"
        description={
          confirmExpected ? (
            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {confirmMessage}
              </p>
              <div className="space-y-2 rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/30">
                <p className="text-xs text-red-600 dark:text-red-400 uppercase font-black tracking-widest">
                  Verification Required
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Type <span className="font-mono font-bold text-red-600 dark:text-red-400">{confirmExpected}</span> below.
                </p>
                <Input
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={confirmExpected}
                  className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-900/50"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium py-4">{confirmMessage}</p>
          )
        }
        onConfirm={async () => {
          await confirmActionRef.current?.()
        }}
        confirmLabel="Confirm Action"
        cancelLabel="Cancel"
        confirmDisabled={
          !!confirmExpected &&
          confirmInput.trim().toLowerCase() !== confirmExpected
        }
      />
    </PageBackground>
  )
}
