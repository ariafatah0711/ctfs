'use client'

import { Settings } from 'lucide-react'
import { Switch } from '@/shared/ui'
import type { ChallengeFilterSettings } from '../../types'

type FilterSettingsMenuProps = {
  open: boolean
  settings: ChallengeFilterSettings
  onOpenChange: (open: boolean) => void
  onSettingsChange: (settings: ChallengeFilterSettings) => void
}

export default function FilterSettingsMenu({
  open,
  settings,
  onOpenChange,
  onSettingsChange,
}: FilterSettingsMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        data-tour="challenge-filter-settings"
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition ${
          open
            ? 'border-orange-500 bg-orange-500 text-white'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        aria-label="Open filter settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 z-40">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Hide maintenance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exclude maintenance challenges</p>
            </div>
            <Switch
              checked={settings.hideMaintenance}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, hideMaintenance: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Team solve highlight</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Purple cards for team solves</p>
            </div>
            <Switch
              checked={settings.highlightTeamSolves}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, highlightTeamSolves: checked })
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
