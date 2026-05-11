'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus } from 'lucide-react'

import { Loader } from '@/shared/components'
import { BackButton, ConfirmDialog, EventSelect } from '@/shared/components/custom'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/shared/ui'
import { useAuth, useEventContext } from '@/shared/contexts'

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
  // We need a temporary event state for the hook to calculate effective event
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
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {initialLoading ? (
          <div className="flex justify-center py-16">
            <Loader color="text-orange-500" />
          </div>
        ) : (
          <>
            {loading && team && (
              <div className="fixed top-20 right-8 z-50 opacity-70 pointer-events-none">
                <Loader color="text-orange-500" />
              </div>
            )}

            {team && (
              <div className="mb-4 flex justify-between items-center">
                <BackButton label="Go Back" className="mb-2" />
                <EventSelect
                  value={effectiveSelectedEvent}
                  onChange={setSelectedEvent}
                  events={teamEvents as any}
                  showMain={showMainOption}
                  className="min-w-[180px]"
                  getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
                />
              </div>
            )}

            {status && (
              <div
                className={`rounded-md px-4 py-3 text-sm ${status.type === 'error'
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                  }`}
              >
                {status.message}
              </div>
            )}

            {!team ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users size={18} /> Create Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Team name"
                      disabled={busy}
                    />
                    <Button
                      onClick={onCreateTeam}
                      disabled={busy || !teamName.trim()}
                      className="w-full"
                    >
                      Create
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserPlus size={18} /> Join Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Invite code"
                      disabled={busy}
                    />
                    <Button
                      onClick={onJoinTeam}
                      disabled={busy || !inviteCode.trim()}
                      className="w-full"
                    >
                      Join
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={effectiveSelectedEvent}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <TeamPageContent
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
                  />
                </motion.div>
              </AnimatePresence>
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
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {confirmMessage}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type{' '}
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {confirmExpected}
                </span>{' '}
                to continue.
              </p>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={confirmExpected}
              />
            </div>
          ) : (
            confirmMessage
          )
        }
        onConfirm={async () => {
          await confirmActionRef.current?.()
        }}
        confirmLabel="Yes"
        cancelLabel="Cancel"
        confirmDisabled={
          !!confirmExpected &&
          confirmInput.trim().toLowerCase() !== confirmExpected
        }
      />
    </div>
  )
}
