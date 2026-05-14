'use client'

import React from 'react'
import { Crown, Users, Trophy, Flag, Hash, Calendar, Copy, RefreshCw, LogOut, Eye, EyeOff } from 'lucide-react'
import EventSelect from '@/features/events/components/EventSelect'
import { Button } from '@/shared/ui/button'
import { TeamInfo, TeamSummary } from '../types'

interface TeamProfileHeaderProps {
  team: TeamInfo
  summary: TeamSummary | null
  effectiveSelectedEvent: string | 'all'
  setSelectedEvent: (eventId: string | 'all') => void
  teamEvents: any[]
  showMainOption: boolean
  canManage: boolean
  onCopyInvite?: () => void
  onRegenerateInvite?: () => void
  onLeaveTeam?: () => void
  busy: boolean
  isMember?: boolean
}

export default function TeamProfileHeader({
  team,
  summary,
  effectiveSelectedEvent,
  setSelectedEvent,
  teamEvents,
  showMainOption,
  canManage,
  onCopyInvite,
  onRegenerateInvite,
  onLeaveTeam,
  busy,
  isMember = false
}: TeamProfileHeaderProps) {
  const [showInvite, setShowInvite] = React.useState(false)
  const teamInitials = team.name.slice(0, 2).toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/50 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-[#111622]/50">
      {/* Decorative background element */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Event Selector - Positioned Top Right on MD+ */}
      <div className="md:absolute md:top-6 md:right-6 mb-6 md:mb-0 z-20">
        <EventSelect
          value={effectiveSelectedEvent}
          onChange={setSelectedEvent}
          events={teamEvents}
          showMain={showMainOption}
          className="min-w-[180px]"
          getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
        {/* Team Avatar/Icon */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl ring-4 ring-white dark:ring-gray-800">
          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">
            {teamInitials}
          </div>
          <div className="absolute inset-0 bg-black/5" />
        </div>

        {/* Team Basic Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              {team.name}
            </h1>
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Users size={12} />
              Team
            </div>

            {/* Quick Actions for Members */}
            {isMember && onLeaveTeam && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLeaveTeam}
                disabled={busy}
                className="h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-[10px] font-black uppercase tracking-widest px-3"
              >
                <LogOut size={12} className="mr-1" /> Leave Team
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" />
              <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
            </div>

            {/* Privacy: Only show invite code to team members */}
            {isMember && team.invite_code && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-100/50 px-2.5 py-1 font-mono text-xs dark:bg-gray-800/50">
                <Hash size={12} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300 min-w-[80px]">
                  {showInvite ? team.invite_code : '••••••••'}
                </span>

                <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 ml-1 pl-2">
                  <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                    title={showInvite ? "Hide" : "Show"}
                  >
                    {showInvite ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={onCopyInvite}
                    disabled={busy}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                    title="Copy Invite Code"
                  >
                    <Copy size={12} />
                  </button>
                  {canManage && (
                    <button
                      onClick={onRegenerateInvite}
                      disabled={busy}
                      className="text-gray-400 hover:text-yellow-500 transition-colors p-1"
                      title="Regenerate Invite Code"
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 sm:grid-cols-3">
        <StatItem
          icon={<Hash className="text-emerald-500" />}
          label="Rank"
          value={summary?.rank ? `#${summary.rank}` : '-'}
        />
        <StatItem
          icon={<Trophy className="text-yellow-500" />}
          label="Points"
          value={summary?.total_score ?? summary?.unique_score ?? 0}
        />
        <StatItem
          icon={<Flag className="text-blue-500" />}
          label="Solves"
          value={summary?.unique_challenges ?? 0}
        />
      </div>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/50">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  )
}
