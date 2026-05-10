'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Plus, Loader2, X, Megaphone, Settings2, Trash2, Calendar } from 'lucide-react'
import { Switch } from '@/shared/ui'
import { MarkdownRenderer } from '@/shared/components'
import { formatRelativeDate } from '@/shared/lib'
import NotificationItem from './NotificationItem'

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
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
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
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
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
          <AnimatePresence mode="wait">
            {activeTab === 'notifications' ? (
              <motion.div
                key="notifs"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="p-3 flex flex-col gap-1"
              >
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
                  notifItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      isRead={isNotifRead(n.id)}
                      theme={theme}
                      globalAdminStatus={globalAdminStatus}
                      getLevelBadgeClass={getLevelBadgeClass}
                      onDelete={handleDeleteNotif}
                    />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="p-5 space-y-6"
              >
                {/* Broadcast Form */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus size={14} className="text-blue-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">New Broadcast</h3>
                  </div>
                  <div className="space-y-2.5 bg-blue-500/[0.02] dark:bg-blue-400/[0.02] p-3.5 rounded-xl border border-blue-500/10">
                    <input
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="Title"
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                    />
                    <textarea
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="Message..."
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                      rows={2}
                    />
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <select
                        value={notifLevel}
                        onChange={(e) => setNotifLevel(e.target.value as any)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold focus:outline-none ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        <option value="info">General Info</option>
                        <option value="info_platform">Platform Update</option>
                        <option value="info_challenges">Challenge Alert</option>
                      </select>
                      <button
                        onClick={handleSendNotif}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all active:scale-95 shadow-sm"
                      >
                        Send
                      </button>
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
                      <div
                        key={n.id}
                        onMouseEnter={() => setHoveredNotifId(n.id)}
                        onMouseLeave={() => setHoveredNotifId(null)}
                        className={`group relative p-2.5 rounded-lg border transition-all duration-200 cursor-default
                            ${hoveredNotifId === n.id
                            ? 'bg-white dark:bg-gray-900 border-blue-500/20 shadow-sm'
                            : 'bg-transparent border-transparent'}
                          `}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-semibold truncate flex-1">{n.title}</span>
                          <button
                            onClick={() => handleDeleteNotif(n.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {hoveredNotifId === n.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700/50">
                                <MarkdownRenderer content={n.message} variant="compact" />
                              </div>
                              <div className="mt-1.5 text-[9px] text-gray-400 font-medium">
                                {formatRelativeDate(n.created_at)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
