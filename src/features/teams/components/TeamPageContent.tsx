'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { TeamMember, TeamInfo, TeamSummary, TeamChallenge } from '../types'
import TeamProfileHeader from '@/features/teams/components/TeamProfileHeader'
import TeamSolves from '@/features/teams/components/TeamSolves'
import TeamTabs from '@/features/teams/components/TeamTabs'
import TeamManageSection from '@/features/teams/components/TeamManageSection'
import TeamMembersSection from '@/features/teams/components/TeamMembersSection'

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

  // New props for the updated design
  effectiveSelectedEvent: string | 'all'
  setSelectedEvent: (eventId: string | 'all') => void
  teamEvents: any[]
  showMainOption: boolean
  onBack?: () => void
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

  effectiveSelectedEvent,
  setSelectedEvent,
  teamEvents,
  showMainOption,
  onBack
}: TeamPageContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'solves' | 'manage'>('overview')

  // Determine if the current user is a member of this team
  const isMember = members.some(m => m.user_id === currentUserId)

  return (
    <div className="space-y-6">
      <TeamTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={onBack}
        canManage={canManage}
      />

      <TeamProfileHeader
        team={team}
        summary={summary}
        effectiveSelectedEvent={effectiveSelectedEvent}
        setSelectedEvent={setSelectedEvent}
        teamEvents={teamEvents}
        showMainOption={showMainOption}
        canManage={canManage}
        onCopyInvite={onCopyInvite}
        onRegenerateInvite={onRegenerateInvite}
        onLeaveTeam={onLeaveTeam}
        busy={busy}
        isMember={isMember}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6">
              <TeamMembersSection
                members={members.slice(0, 5)}
                canManage={canManage}
                currentUserId={currentUserId}
                onKickMember={onKickMember}
                onTransferCaptain={onTransferCaptain}
                busy={busy}
                isOverview
                onSeeAll={() => setActiveTab('members')}
              />
              <TeamSolves challenges={challenges} />
            </div>
          )}

          {activeTab === 'members' && (
            <TeamMembersSection
              members={members}
              canManage={canManage}
              currentUserId={currentUserId}
              onKickMember={onKickMember}
              onTransferCaptain={onTransferCaptain}
              busy={busy}
            />
          )}

          {activeTab === 'solves' && (
            <TeamSolves challenges={challenges} title="Full Solves History" />
          )}

          {activeTab === 'manage' && canManage && (
            <TeamManageSection
              team={team}
              onRenameTeam={onRenameTeam}
              onLeaveTeam={onLeaveTeam}
              onDeleteTeam={onDeleteTeam}
              busy={busy}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
