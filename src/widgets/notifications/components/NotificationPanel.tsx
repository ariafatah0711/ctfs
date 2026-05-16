'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, Plus, Loader2, X, Megaphone, Settings2, Trash2, Calendar } from 'lucide-react'
import { Switch } from '@/shared/ui'
import { Button } from '@/shared/ui/button'
import { SURFACE_GLASS_INPUT_CLASS, SURFACE_GLASS_TEXTAREA_CLASS } from '@/shared/styles'
import { cn, formatRelativeDate } from '@/shared/lib/utils'
import { BaseModal, ModalHeader, ModalBody } from '@/shared/components/BaseModal'
import NotificationItem from './NotificationItem'

function formatNotificationText(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, (match) => match.slice(3, -3))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

type NotificationPanelProps = {
  theme: string
  notifPanelRef: React.RefObject<HTMLDivElement>
  setNotifOpen: (open: boolean) => void
  markAllNotificationsRead: () => void
  solveSoundEnabled: boolean
  setSolveSoundEnabled: (enabled: boolean) => void
  globalAdminStatus: boolean
  notifTitle: string
  setNotifTitle: (title: string) => void
  notifMessage: string
  setNotifMessage: (message: string) => void
  notifLevel: 'info' | 'info_platform' | 'info_challenges'
  setNotifLevel: (level: 'info' | 'info_platform' | 'info_challenges') => void
  handleSendNotif: () => void
  notifLoading: boolean
  notifItems: Array<{ id: string; title: string; message: string; level: string; created_at: string }>
  isNotifRead: (id: string) => boolean
  getLevelBadgeClass: (level: string) => string
  handleDeleteNotif: (id: string) => void
}

export default function NotificationPanel({
  theme,
  notifPanelRef,
  setNotifOpen,
  markAllNotificationsRead,
  solveSoundEnabled,
  setSolveSoundEnabled,
  globalAdminStatus,
  notifTitle,
  setNotifTitle,
  notifMessage,
  setNotifMessage,
  notifLevel,
  setNotifLevel,
  handleSendNotif,
  notifLoading,
  notifItems,
  isNotifRead,
  getLevelBadgeClass,
  handleDeleteNotif,
}: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'admin'>(
    globalAdminStatus ? 'notifications' : 'notifications'
  )

  const [hoveredNotifId, setHoveredNotifId] = useState<string | null>(null)
  const [selectedNotif, setSelectedNotif] = useState<typeof notifItems[0] | null>(null)

  const groupedNotifs = React.useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const yesterdayDate = new Date(now)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toDateString()

    const groups: Record<string, typeof notifItems> = {
      Today: [],
      Yesterday: [],
      Earlier: []
    }

    notifItems.forEach(n => {
      const d = new Date(n.created_at).toDateString()
      if (d === todayStr) groups.Today.push(n)
      else if (d === yesterdayStr) groups.Yesterday.push(n)
      else groups.Earlier.push(n)
    })

    return groups
  }, [notifItems])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={() => setNotifOpen(false)}
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[50]"
      />

      {/* Drawer */}
      <motion.div
        ref={notifPanelRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ willChange: 'transform' }}
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] shadow-2xl border-l flex flex-col z-[51]
          ${theme === 'dark' ? 'bg-[#0d1117] border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}
        `}
      >
        {/* Header Section */}
        <div className="pt-6 px-5 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">Notifications</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:bg-blue-500/10 px-2.5 py-1.5 rounded-md transition-all"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={() => setNotifOpen(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Admin Tabs */}
          {globalAdminStatus && (
            <div className="flex items-center gap-6 px-1 border-b border-transparent">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`pb-2 text-xs font-semibold transition-all relative
                  ${activeTab === 'notifications'
                    ? 'text-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
                `}
              >
                Penonton
                {activeTab === 'notifications' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`pb-2 text-xs font-semibold transition-all relative
                  ${activeTab === 'admin'
                    ? 'text-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
                `}
              >
                Admin Panel
                {activeTab === 'admin' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          )}

          {!globalAdminStatus && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Recent Activity</span>
            </div>
          )}
        </div>

        {/* Global Settings */}
        <div className="px-5 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/10">
          <div className="flex items-center gap-2">
            <Megaphone size={13} className="text-orange-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Solve Sounds</span>
          </div>
          <Switch
            checked={solveSoundEnabled}
            onCheckedChange={setSolveSoundEnabled}
            className="scale-75 origin-right"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'notifications' ? (
            <div key="notifs" className="p-3 flex flex-col gap-1">
              {notifLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className="text-xs font-medium opacity-70">Loading...</span>
                </div>
              ) : notifItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-30">
                  <Bell size={40} strokeWidth={1} />
                  <p className="text-xs font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(['Today', 'Yesterday', 'Earlier'] as const).map(group => {
                    if (groupedNotifs[group].length === 0) return null
                    return (
                      <div key={group} className="flex flex-col gap-1.5">
                        <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500/70">
                          {group}
                        </h3>
                        {groupedNotifs[group].map((n) => (
                          <NotificationItem
                            key={n.id}
                            notification={n}
                            isRead={isNotifRead(n.id)}
                            theme={theme}
                            globalAdminStatus={globalAdminStatus}
                            getLevelBadgeClass={getLevelBadgeClass}
                            onClick={() => setSelectedNotif(n)}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div key="admin" className="p-5 space-y-6">
              {/* Broadcast Form */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-blue-500" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">New Broadcast</h3>
                </div>
                <div className="space-y-2">
                  <input
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="Title"
                    className={cn(SURFACE_GLASS_INPUT_CLASS, "h-10")}
                  />
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="Message..."
                    className={cn(SURFACE_GLASS_TEXTAREA_CLASS, "min-h-[80px] resize-y")}
                    rows={2}
                  />
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <select
                      value={notifLevel}
                      onChange={(e) => setNotifLevel(e.target.value as any)}
                      className={cn(SURFACE_GLASS_INPUT_CLASS, "h-9 w-auto text-xs py-0 pr-8 bg-white/50 dark:bg-[#111622]/50")}
                    >
                      <option value="info">Broadcast</option>
                      <option value="info_platform">System</option>
                      <option value="info_challenges">Challenges</option>
                    </select>
                    <Button
                      onClick={handleSendNotif}
                      size="sm"
                      className="px-5 font-bold uppercase tracking-wider text-[10px]"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">History</h3>
                  </div>
                  <span className="text-[9px] font-bold text-blue-500 opacity-60 uppercase">
                    {notifItems.length} Sent
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {notifItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      isRead={isNotifRead(n.id)}
                      theme={theme}
                      globalAdminStatus={globalAdminStatus}
                      getLevelBadgeClass={getLevelBadgeClass}
                      onDelete={handleDeleteNotif}
                      onClick={() => setSelectedNotif(n)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <BaseModal
        open={!!selectedNotif}
        onOpenChange={(open) => {
          if (!open) setSelectedNotif(null)
        }}
        size="2xl"
      >
        {selectedNotif && (
          <>
            <ModalHeader
              title={selectedNotif.title}
              description={
                <div className="flex items-center gap-2 mt-1 uppercase tracking-wider text-[10px] font-bold">
                  <span className={getLevelBadgeClass(selectedNotif.level)}>
                    {selectedNotif.level.replace('info_', '')}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeDate(selectedNotif.created_at)}</span>
                </div>
              }
            />
            <ModalBody>
              <div className="text-[13px] text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                {formatNotificationText(selectedNotif.message)}
              </div>
            </ModalBody>
          </>
        )}
      </BaseModal>
    </>
  )
}
