'use client'

import React from 'react'
import { Calendar, Flag, Hash, LogOut, Trophy } from 'lucide-react'
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
  onLeaveTeam,
  busy,
  isMember = false,
}: TeamProfileHeaderProps) {
  const teamInitials = team.name.slice(0, 2).toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#111622]/50 sm:p-5">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl ring-4 ring-white dark:ring-gray-800">
            <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
              {teamInitials}
            </div>
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="truncate text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {team.name}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={14} className="text-blue-500" />
              <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-[260px]">
          <EventSelect
            value={effectiveSelectedEvent}
            onChange={setSelectedEvent}
            events={teamEvents}
            showMain={showMainOption}
            className="w-full"
            getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
          />

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            {isMember && onLeaveTeam && (
              <Button
                variant="ghost"
                onClick={onLeaveTeam}
                disabled={busy}
                className="h-10 w-full flex-1 rounded-xl border border-red-200/70 bg-red-50/70 px-4 text-xs font-black uppercase tracking-widest text-red-600 shadow-sm hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                <LogOut size={12} className="mr-1" /> Leave Team
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-3">
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
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/50">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </div>
        <div className="text-base font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  )
}
