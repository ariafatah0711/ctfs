'use client'

import Link from 'next/link'
import { InfoIcon, Users, Crown, ChartColumnDecreasing, Copy, Wrench, RefreshCw, LogOut, Trash2, CheckCircle2, Sparkles, Coins } from 'lucide-react'
import EditTeamModal from '@/components/teams/EditTeamModal'
import TeamSolves from '@/components/teams/TeamSolves'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TeamMember, TeamInfo, TeamSummary, TeamChallenge } from '@/lib/teams'

interface TeamPageContentProps {
  team: TeamInfo
  members: TeamMember[]
  summary: TeamSummary | null
  challenges: TeamChallenge[]
  currentUserId?: string
  canManage?: boolean
  busy?: boolean
  showManageActions?: boolean
  onRenameTeam?: (newName: string) => Promise<{ success: boolean; error?: string }>
  onCopyInvite?: () => void
  onRegenerateInvite?: () => void
  onLeaveTeam?: () => void
  onDeleteTeam?: () => void
  onKickMember?: (member: TeamMember) => void
  onTransferCaptain?: (member: TeamMember) => void
}

export default function TeamPageContent({
  team,
  members,
  summary,
  challenges,
  currentUserId,
  canManage = false,
  busy = false,
  showManageActions = false,
  onRenameTeam,
  onCopyInvite,
  onRegenerateInvite,
  onLeaveTeam,
  onDeleteTeam,
  onKickMember,
  onTransferCaptain,
}: TeamPageContentProps) {
  const currentMember = members.find(m => m.user_id === currentUserId)

  return (
    <div className="space-y-6">
      {/* Team Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <InfoIcon size={18} className="text-blue-500" /> Team Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Team Name</div>
              <div className="flex items-center gap-2 justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</div>
                {canManage && onRenameTeam && (
                  <EditTeamModal
                    currentName={team.name}
                    onSave={onRenameTeam}
                    disabled={busy}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartColumnDecreasing size={18} className="text-yellow-500" /> Team Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-200 to-indigo-400 dark:from-indigo-900 dark:to-indigo-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-indigo-300/60 dark:ring-indigo-800/60">
                <CheckCircle2 className="h-5 w-5 text-indigo-800 dark:text-indigo-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.unique_challenges ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Solves</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-green-300/60 dark:ring-green-800/60">
                <Sparkles className="h-5 w-5 text-green-800 dark:text-green-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.unique_score ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unique Score</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-900 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-blue-300/60 dark:ring-blue-800/60">
                <Coins className="h-5 w-5 text-blue-800 dark:text-blue-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.total_score ?? summary?.unique_score ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showManageActions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Copy size={18} className="text-green-500" /> Invite Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded border border-green-200 dark:border-green-700 break-all">
                  {team.invite_code}
                </div>
                {onCopyInvite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCopyInvite}
                    disabled={busy}
                    className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold border-none"
                  >
                    <Copy size={14} />
                  </Button>
                )}
              </div>
              {canManage && onRegenerateInvite && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerateInvite}
                  disabled={busy}
                  className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold border-none"
                >
                  <RefreshCw size={14} /> Regenerate Code
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
             <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <Wrench size={18} className="text-red-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {onLeaveTeam && (
                <Button variant="secondary" size="sm" onClick={onLeaveTeam} disabled={busy} className="w-full">
                  <LogOut size={14} /> Leave Team
                </Button>
              )}
              {canManage && onDeleteTeam && (
                <Button variant="destructive" size="sm" onClick={onDeleteTeam} disabled={busy} className="w-full">
                  <Trash2 size={14} /> Delete Team
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {members.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-300">No members found.</div>
          ) : (
            members.map((m) => (
              <div key={m.user_id} className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 py-3 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded px-2">
                <div className="flex items-start gap-2 min-w-0">
                  {/* {m.role === 'captain' ? (
                    <Crown size={16} className="text-yellow-500 dark:text-yellow-400" />
                  ) : (
                    <Users size={16} className="text-gray-400" />
                  )} */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.role === 'captain' ? <Crown size={16} className="text-yellow-500 dark:text-yellow-400" /> : <Users size={16} className="text-gray-400" />}
                      <Link
                        href={`/user/${encodeURIComponent(m.username)}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors truncate max-w-[220px]"
                      >
                        {m.username}
                      </Link>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        m.role === 'captain'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {m.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        Solves <span className="font-semibold text-gray-900 dark:text-white">{m.first_solve_count ?? 0}</span>
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        Points <span className="font-semibold text-gray-900 dark:text-white">{m.first_solve_score ?? 0}</span>
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        Total Points <span className="font-semibold text-gray-900 dark:text-white">{m.solo_score ?? 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {canManage && m.user_id !== currentUserId && onKickMember && onTransferCaptain && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTransferCaptain(m)}
                      disabled={busy}
                      aria-label={`Make ${m.username} captain`}
                    >
                      <Crown size={14} /> Make Captain
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onKickMember(m)}
                      disabled={busy}
                      aria-label={`Kick ${m.username} from team`}
                    >
                      Kick
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <TeamSolves challenges={challenges} />
    </div>
  )
}
