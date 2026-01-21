'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, UserPlus, LogOut, RefreshCw, Trash2, Crown, Shield, Copy } from 'lucide-react'
import TitlePage from '@/components/custom/TitlePage'
import Loader from '@/components/custom/loading'
import ConfirmDialog from '@/components/custom/ConfirmDialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/admin'
import {
  createTeam,
  joinTeam,
  leaveTeam,
  deleteTeam,
  regenerateTeamInviteCode,
  getMyTeam,
  getMyTeamSummary,
  getMyTeamChallenges,
  kickTeamMember,
  transferTeamCaptain,
  renameTeam,
  TeamMember,
  TeamInfo,
  TeamSummary,
  TeamChallenge,
} from '@/lib/teams'

export default function TeamsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [summary, setSummary] = useState<TeamSummary | null>(null)
  const [challenges, setChallenges] = useState<TeamChallenge[]>([])
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const [adminStatus, setAdminStatus] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('Are you sure?')
  const [confirmExpected, setConfirmExpected] = useState<string | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const confirmActionRef = useRef<() => Promise<void> | void>(() => {})

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) {
      setAdminStatus(false)
      return
    }
    isAdmin().then(setAdminStatus)
  }, [user])

  const loadTeamData = async () => {
    if (!user) return
    setLoading(true)
    setStatus(null)
    try {
      const [teamRes, summaryRes, challengesRes] = await Promise.all([
        getMyTeam(),
        getMyTeamSummary(),
        getMyTeamChallenges(),
      ])

      setTeam(teamRes.team ?? null)
      setMembers(teamRes.members ?? [])
      setSummary(summaryRes.stats ?? null)
      setChallenges(challengesRes.challenges ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadTeamData()
  }, [user])

  const currentMember = useMemo(() => members.find(m => m.user_id === user?.id), [members, user])
  const isCaptain = currentMember?.role === 'captain'
  const canManage = isCaptain || adminStatus

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return String(value)
    return dt.toLocaleString()
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    setBusy(true)
    setStatus(null)
    const { error } = await createTeam(teamName.trim())
    if (error) {
      setStatus({ type: 'error', message: error })
    } else {
      setTeamName('')
      setStatus({ type: 'success', message: 'Team created.' })
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return
    setBusy(true)
    setStatus(null)
    const { error } = await joinTeam(inviteCode.trim())
    if (error) {
      setStatus({ type: 'error', message: error })
    } else {
      setInviteCode('')
      setStatus({ type: 'success', message: 'Joined team.' })
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleLeaveTeam = async () => {
    if (!team) return
    setConfirmMessage('Leave this team?')
    setConfirmExpected('leave this team')
    setConfirmInput('')
    confirmActionRef.current = async () => {
      setBusy(true)
      setStatus(null)
      const { success, error } = await leaveTeam()
      if (!success) {
        setStatus({ type: 'error', message: error || 'Failed to leave team.' })
      } else {
        setStatus({ type: 'success', message: 'You left the team.' })
        await loadTeamData()
      }
      setBusy(false)
    }
    setConfirmOpen(true)
  }

  const handleDeleteTeam = async () => {
    if (!team) return
    setConfirmMessage('Delete this team? This cannot be undone.')
    setConfirmExpected('delete this team')
    setConfirmInput('')
    confirmActionRef.current = async () => {
      setBusy(true)
      setStatus(null)
      const { success, error } = await deleteTeam(team.id)
      if (!success) {
        setStatus({ type: 'error', message: error || 'Failed to delete team.' })
      } else {
        setStatus({ type: 'success', message: 'Team deleted.' })
        await loadTeamData()
      }
      setBusy(false)
    }
    setConfirmOpen(true)
  }

  const handleRegenerateInvite = async () => {
    if (!team) return
    setConfirmMessage('Regenerate invite code? Old code will be invalid.')
    setConfirmExpected(null)
    setConfirmInput('')
    confirmActionRef.current = async () => {
      setBusy(true)
      setStatus(null)
      const { error } = await regenerateTeamInviteCode(team.id)
      if (error) {
        setStatus({ type: 'error', message: error })
      } else {
        setStatus({ type: 'success', message: 'Invite code regenerated.' })
        await loadTeamData()
      }
      setBusy(false)
    }
    setConfirmOpen(true)
  }

  const handleCopyInvite = async () => {
    if (!team?.invite_code) return
    try {
      await navigator.clipboard.writeText(team.invite_code)
      setStatus({ type: 'success', message: 'Invite code copied.' })
    } catch {
      setStatus({ type: 'error', message: 'Failed to copy invite code.' })
    }
  }

  const handleKickMember = async (member: TeamMember) => {
    if (!team) return
    setConfirmMessage(`Kick ${member.username} from the team?`)
    setConfirmExpected(null)
    setConfirmInput('')
    confirmActionRef.current = async () => {
      setBusy(true)
      setStatus(null)
      const { success, error } = await kickTeamMember(team.id, member.user_id)
      if (!success) {
        setStatus({ type: 'error', message: error || 'Failed to kick member.' })
      } else {
        setStatus({ type: 'success', message: `${member.username} kicked.` })
        await loadTeamData()
      }
      setBusy(false)
    }
    setConfirmOpen(true)
  }

  const handleTransferCaptain = async (member: TeamMember) => {
    if (!team) return
    setConfirmMessage(`Transfer captain role to ${member.username}? You will become a regular member.`)
    setConfirmExpected('transfer captain')
    setConfirmInput('')
    confirmActionRef.current = async () => {
      setBusy(true)
      setStatus(null)
      try {
        const { success, error } = await transferTeamCaptain(team.id, member.user_id)
        if (!success) {
          setStatus({ type: 'error', message: error || 'Failed to transfer captain.' })
          console.error('Transfer captain error:', error)
        } else {
          setStatus({ type: 'success', message: `${member.username} is now captain.` })
          await loadTeamData()
        }
      } catch (err: any) {
        setStatus({ type: 'error', message: err?.message || 'Unexpected error occurred.' })
        console.error('Transfer captain exception:', err)
      } finally {
        setBusy(false)
      }
    }
    setConfirmOpen(true)
  }

  const handleRenameTeam = async () => {
    if (!team || !newTeamName.trim()) return
    setBusy(true)
    setStatus(null)
    const { success, error } = await renameTeam(team.id, newTeamName.trim())
    if (!success) {
      setStatus({ type: 'error', message: error || 'Failed to rename team.' })
    } else {
      setStatus({ type: 'success', message: 'Team renamed.' })
      setNewTeamName('')
      await loadTeamData()
    }
    setBusy(false)
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
        <TitlePage icon={<Users size={30} className="text-blue-500 dark:text-blue-300" />}>Teams</TitlePage>

        {status && (
          <div className={`rounded-md px-4 py-3 text-sm ${status.type === 'error'
            ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
          }`}>
            {status.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader fullscreen color="text-orange-500" />
          </div>
        ) : !team ? (
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
                <Button onClick={handleCreateTeam} disabled={busy || !teamName.trim()} className="w-full">
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
                <Button onClick={handleJoinTeam} disabled={busy || !inviteCode.trim()} className="w-full">
                  Join
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users size={18} /> Team Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-500 dark:text-gray-300">Name</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</div>

                  {canManage && (
                    <>
                      <div className="text-sm text-gray-500 dark:text-gray-300 pt-2">Rename Team</div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="New team name"
                          disabled={busy}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={handleRenameTeam} disabled={busy || !newTeamName.trim()}>
                          Rename
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="text-sm text-gray-500 dark:text-gray-300 pt-2">Invite Code</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{team.invite_code}</span>
                    <Button variant="outline" size="sm" onClick={handleCopyInvite} disabled={busy}>
                      <Copy size={14} /> Copy
                    </Button>
                    {canManage && (
                      <Button variant="outline" size="sm" onClick={handleRegenerateInvite} disabled={busy}>
                        <RefreshCw size={14} /> Regenerate
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="secondary" size="sm" onClick={handleLeaveTeam} disabled={busy}>
                      <LogOut size={14} /> Leave
                    </Button>
                    {canManage && (
                      <Button variant="destructive" size="sm" onClick={handleDeleteTeam} disabled={busy}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Team Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{summary?.total_score ?? 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Score</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{summary?.unique_challenges ?? 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Challenges</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{summary?.total_solves ?? 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Solves</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-300">No members found.</div>
                ) : (
                  members.map((m) => (
                    <div key={m.user_id} className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 py-2">
                      <div className="flex items-center gap-2">
                        {m.role === 'captain' ? <Crown size={16} className="text-yellow-500" /> : <Users size={16} className="text-gray-400" />}
                        <Link
                          href={`/user/${encodeURIComponent(m.username)}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                          {m.username}
                        </Link>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                          {m.role}
                        </span>
                      </div>
                      {canManage && m.user_id !== user.id && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleTransferCaptain(m)} disabled={busy}>
                            <Shield size={14} /> Make Captain
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleKickMember(m)} disabled={busy}>
                            Kick
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Team Solves</CardTitle>
              </CardHeader>
              <CardContent>
                {challenges.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-300">No solves yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Challenge</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead>First Solve</TableHead>
                        <TableHead>First Solver</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {challenges.map((c) => (
                        <TableRow key={c.challenge_id}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">{c.title}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{c.category}</TableCell>
                          <TableCell className="text-center">{c.points}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(c.first_solved_at)}</TableCell>
                          <TableCell className="text-gray-900 dark:text-white">{c.first_solver_username}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
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
              <p className="text-sm text-gray-700 dark:text-gray-300">{confirmMessage}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type <span className="font-mono text-gray-900 dark:text-gray-100">{confirmExpected}</span> to continue.
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
        confirmDisabled={!!confirmExpected && confirmInput.trim().toLowerCase() !== confirmExpected}
      />
    </div>
  )
}
