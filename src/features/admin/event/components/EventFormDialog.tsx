import React from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Textarea,
} from '@/shared/ui'
import { DIALOG_CONTENT_CLASS } from '@/shared/styles'
import type { Event, EventFormData, EventJoinMode } from '../types'

interface EventFormDialogProps {
  open: boolean
  editing: Event | null
  formData: EventFormData
  submitting: boolean
  onOpenChange: (value: boolean) => void
  onChange: (data: EventFormData) => void
  onSubmit: (e?: React.FormEvent) => void
  onRegenerateJoinKey: () => void
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
  open,
  editing,
  formData,
  submitting,
  onOpenChange,
  onChange,
  onSubmit,
  onRegenerateJoinKey,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${DIALOG_CONTENT_CLASS} max-w-3xl p-4 md:p-8 max-h-[85dvh] overflow-y-auto scroll-hidden`}
        style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
      >
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
            </div>

            <div>
              <Label>Join Mode</Label>
              <select
                value={formData.join_mode}
                onChange={(e) => onChange({ ...formData, join_mode: e.target.value as EventJoinMode })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              >
                <option value="open">Open (direct join)</option>
                <option value="request">Request (admin approval)</option>
                <option value="key">Key (invite key)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Join Key</Label>
                {editing?.id && formData.join_mode === 'key' && (
                  <button type="button" onClick={onRegenerateJoinKey} className="text-xs text-primary-600 hover:underline">
                    Regenerate
                  </button>
                )}
              </div>
              <Input
                value={formData.join_key}
                onChange={(e) => onChange({ ...formData, join_key: e.target.value })}
                disabled={formData.join_mode !== 'key'}
                placeholder={formData.join_mode === 'key' ? 'Enter custom join key' : 'Join key only for key mode'}
                className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Start Time</Label>
                {formData.start_time && (
                  <button type="button" onClick={() => onChange({ ...formData, start_time: '' })} className="text-xs text-gray-500 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <Input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => onChange({ ...formData, start_time: e.target.value })}
                className="h-9 px-2 text-sm transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>End Time</Label>
                {formData.end_time && (
                  <button type="button" onClick={() => onChange({ ...formData, end_time: '' })} className="text-xs text-gray-500 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <Input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => onChange({ ...formData, end_time: e.target.value })}
                className="h-9 px-2 text-sm transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800/40">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Always show challenges</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Show event challenges after end.</p>
              </div>
              <Switch checked={formData.always_show_challenges} onCheckedChange={(checked) => onChange({ ...formData, always_show_challenges: checked })} />
            </div>

            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => onChange({ ...formData, image_url: e.target.value })}
                className="transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-md shadow-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Add a banner image URL for this event</p>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 sticky bottom-0 z-10 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-700">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventFormDialog
