'use client'

import React from 'react'
import { Calendar, Flag, Hash, LogOut, Trophy } from 'lucide-react'
import EventSelect from '@/features/events/components/EventSelect'
import { Button } from '@/shared/ui/button'
import {
  SURFACE_GLASS_CARD_COMPACT_CLASS,
  TYPO_PAGE_TITLE_CLASS,
  TYPO_SECTION_TITLE_CLASS,
  TYPO_STAT_VALUE_CLASS,
  TYPO_METADATA_CLASS
} from '@/shared/styles'
import { TeamInfo, TeamSummary } from '../types'
import { cn } from '@/shared/lib/utils'

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
    <div className={cn("relative overflow-hidden p-5", SURFACE_GLASS_CARD_COMPACT_CLASS)}>
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg border border-gray-200/50 dark:border-white/10">
            <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
              {teamInitials}
            </div>
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className={cn(TYPO_PAGE_TITLE_CLASS, "truncate")}>
              {team.name}
            </h1>
            <div className={cn("flex items-center gap-1.5", TYPO_METADATA_CLASS)}>
              <Calendar size={13} className="text-blue-500" />
              <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-[240px]">
          <EventSelect
            value={effectiveSelectedEvent}
            onChange={setSelectedEvent}
            events={teamEvents}
            showMain={showMainOption}
            className="w-full"
            getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
          />

          {isMember && onLeaveTeam && (
            <Button
              variant="ghost"
              onClick={onLeaveTeam}
              disabled={busy}
              className="h-10 w-full rounded-xl border border-red-200/50 bg-red-50/50 px-4 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut size={12} className="mr-1.5" /> Leave Team
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 pt-5 dark:border-gray-800">
        <StatItem
          icon={<Hash size={14} className="text-emerald-500" />}
          label="Rank"
          value={summary?.rank ? `#${summary.rank}` : '-'}
        />
        <StatItem
          icon={<Trophy size={14} className="text-yellow-500" />}
          label="Points"
          value={summary?.total_score ?? summary?.unique_score ?? 0}
        />
        <StatItem
          icon={<Flag size={14} className="text-blue-500" />}
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100/50 dark:bg-gray-800/40">
        {icon}
      </div>
      <div className="min-w-0">
        <div className={cn(TYPO_SECTION_TITLE_CLASS, "!text-[10px] leading-none")}>
          {label}
        </div>
        <div className={cn(TYPO_STAT_VALUE_CLASS, "mt-1 !text-lg sm:!text-xl")}>
          {value}
        </div>
      </div>
    </div>
  )
}
