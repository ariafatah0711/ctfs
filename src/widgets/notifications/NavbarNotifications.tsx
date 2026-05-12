'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'

import NotificationBell from './components/NotificationBell'
import NotificationToast from '@/_layouts/components/notifications/NotificationToast'
import { useNotifications } from '@/_layouts/hooks/useNotifications'

const NotificationPanel = dynamic(
  () => import('./components/NotificationPanel'),
  { ssr: false }
)

type NavbarNotificationsProps = {
  theme: string
  globalAdminStatus: boolean
}

export default function NavbarNotifications({
  theme,
  globalAdminStatus,
}: NavbarNotificationsProps) {
  const pathname = usePathname()
  const previousPathnameRef = useRef(pathname)
  const {
    notifOpen,
    setNotifOpen,
    notifLoading,
    notifUnreadCount,
    notifItems,
    notifTitle,
    setNotifTitle,
    notifMessage,
    setNotifMessage,
    notifLevel,
    setNotifLevel,
    solveNotif,
    notifToast,
    solveSoundEnabled,
    setSolveSoundEnabled,
    notifPanelRef,
    notifButtonRef,
    markAllNotificationsRead,
    openNotifPanel,
    handleSendNotif,
    handleDeleteNotif,
    dismissSolveNotif,
    dismissNotifToast,
    isNotifRead,
    getLevelBadgeClass,
  } = useNotifications()

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      setNotifOpen(false)
    }

    previousPathnameRef.current = pathname
  }, [pathname, setNotifOpen])

  return (
    <>
      <NotificationToast
        solveNotif={solveNotif}
        notifToast={notifToast}
        onDismissSolve={dismissSolveNotif}
        onDismissToast={dismissNotifToast}
      />

      <NotificationBell
        notifButtonRef={notifButtonRef}
        notifOpen={notifOpen}
        theme={theme}
        unreadCount={notifUnreadCount}
        onToggle={openNotifPanel}
      />

      <AnimatePresence>
        {notifOpen && (
          <NotificationPanel
            theme={theme}
            notifPanelRef={notifPanelRef}
            setNotifOpen={setNotifOpen}
            markAllNotificationsRead={markAllNotificationsRead}
            solveSoundEnabled={solveSoundEnabled}
            setSolveSoundEnabled={setSolveSoundEnabled}
            globalAdminStatus={globalAdminStatus}
            notifTitle={notifTitle}
            setNotifTitle={setNotifTitle}
            notifMessage={notifMessage}
            setNotifMessage={setNotifMessage}
            notifLevel={notifLevel}
            setNotifLevel={setNotifLevel}
            handleSendNotif={handleSendNotif}
            notifLoading={notifLoading}
            notifItems={notifItems}
            isNotifRead={isNotifRead}
            getLevelBadgeClass={getLevelBadgeClass}
            handleDeleteNotif={handleDeleteNotif}
          />
        )}
      </AnimatePresence>
    </>
  )
}
