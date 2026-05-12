'use client'

import React from 'react'
import { InfoIcon, Wrench, LogOut, Trash2, Edit2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import EditTeamModal from './EditTeamModal'
import { TeamInfo } from '../types'

interface TeamManageSectionProps {
  team: TeamInfo
  onRenameTeam?: (newName: string) => Promise<{ success: boolean; error?: string }>
  onLeaveTeam?: () => void
  onDeleteTeam?: () => void
  busy?: boolean
}

export default function TeamManageSection({
  team,
  onRenameTeam,
  onLeaveTeam,
  onDeleteTeam,
  busy
}: TeamManageSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white/60 dark:bg-[#111622]/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
            <InfoIcon size={18} className="text-blue-500" /> Team Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
                Display Name
              </label>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{team.name}</span>
                {onRenameTeam && (
                  <EditTeamModal
                    currentName={team.name}
                    onSave={onRenameTeam}
                    disabled={busy}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-all">
                        <Edit2 size={16} className="text-blue-500" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/60 dark:bg-[#111622]/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench size={18} className="text-red-500" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl border border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/10 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Exit Team</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                You will lose access to team solves and progress. If you are the captain, you must transfer ownership first.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onLeaveTeam}
              disabled={busy}
              className="w-full border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
            >
              <LogOut size={14} className="mr-2" /> Leave Team
            </Button>
          </div>

          <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-100/10 dark:bg-red-900/20 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-700 dark:text-red-300">Delete Team</h4>
              <p className="text-xs text-red-600/60 dark:text-red-400/60 leading-relaxed">
                Permanently remove the team and all associated data. This action is irreversible.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={onDeleteTeam}
              disabled={busy}
              className="w-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20"
            >
              <Trash2 size={14} className="mr-2" /> Delete Permanently
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
