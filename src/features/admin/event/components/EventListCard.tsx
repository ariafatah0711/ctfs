import React from 'react'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import type { Event } from '../types'

interface EventListCardProps {
  events: Event[]
  onAdd: () => void
  onEdit: (evt: Event) => void
  onDelete: (evt: Event) => void
}

const EventListCard: React.FC<EventListCardProps> = ({ events, onAdd, onEdit, onDelete }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900 dark:text-white">Event List</CardTitle>
        <Button onClick={onAdd} className="bg-primary-600 text-white hover:bg-primary-700">
          + Add Event
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">No events yet</div>
        ) : (
          <motion.div
            className="divide-y border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {events.map((evt) => (
              <div key={evt.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-gray-900/40">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{evt.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{evt.description || 'No description'}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {evt.start_time ? `Start: ${new Date(evt.start_time).toLocaleString()}` : 'Start: -'}
                    <span className="mx-2">•</span>
                    {evt.end_time ? `End: ${new Date(evt.end_time).toLocaleString()}` : 'End: -'}
                    {evt.always_show_challenges && (
                      <>
                        <span className="mx-2">•</span>
                        Always show challenges
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(evt)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(evt)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default EventListCard
