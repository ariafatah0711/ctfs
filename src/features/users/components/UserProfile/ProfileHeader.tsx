'use client'

import React from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'
import { ImageWithFallback } from '@/shared/components'
import EventSelect from '@/features/events/components/EventSelect'
import SocialIcon from '@/features/users/components/ui/SocialIcon'
import { formatRelativeDate } from '@/shared/lib'
import { UserDetail, Badge } from '../../types'
import EditProfileModal from './EditProfileModal'

type ProfileHeaderProps = {
  userDetail: UserDetail
  avatarSrc: string | null
  badges: Badge[]
  effectiveSelectedEvent: string
  setSelectedEvent: (eventId: string) => void
  profileEvents: any[]
  showMainOption: boolean
  isCurrentUser: boolean
  authInfo: any[]
  refreshUserDetail: () => void
  onUpdateUserDetail: (detail: UserDetail) => void
}

export default function ProfileHeader({
  userDetail,
  avatarSrc,
  effectiveSelectedEvent,
  setSelectedEvent,
  profileEvents,
  showMainOption,
  isCurrentUser,
  authInfo,
  refreshUserDetail,
  onUpdateUserDetail
}: ProfileHeaderProps) {
  return (
    <section
      className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-start md:justify-between"
    >
      <div className="flex w-full flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="relative mx-auto flex h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md dark:border-gray-900 sm:mx-0 sm:h-28 sm:w-28 aspect-square">
          <ImageWithFallback
            src={avatarSrc}
            alt={userDetail.username}
            size={128}
            className="!h-full !w-full object-cover"
            fallbackBg="bg-blue-500/10"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 text-center sm:text-left">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="max-w-full truncate text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
              title={userDetail.username}
            >
              {userDetail.username}
            </h1>
            <EventSelect
              value={effectiveSelectedEvent}
              onChange={setSelectedEvent}
              events={profileEvents as any}
              showMain={showMainOption}
              className="w-full sm:min-w-[180px] md:w-[220px]"
              getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
            />
          </div>

          <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
            {userDetail.bio?.trim() || 'CTF player on NXCTF'}
          </p>

          <div className="mt-1 flex w-full flex-col items-center justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-wrap justify-center items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 sm:flex-nowrap sm:justify-start sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/50 px-2.5 py-1 backdrop-blur dark:border-white/10 dark:bg-gray-900/40">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                Joined {userDetail.created_at ? formatRelativeDate(userDetail.created_at) : '-'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/50 px-2.5 py-1 backdrop-blur dark:border-white/10 dark:bg-gray-900/40">
                <Clock3 className="h-3.5 w-3.5 text-blue-500" />
                Last login {userDetail.last_login_at ? formatRelativeDate(userDetail.last_login_at) : 'Never'}
              </span>
            </div>

            {userDetail.sosmed && (
              <div className="flex items-center gap-2">
                {userDetail.sosmed.linkedin?.trim() && (
                  <SocialIcon
                    type="linkedin"
                    href={userDetail.sosmed.linkedin.startsWith('http')
                      ? userDetail.sosmed.linkedin
                      : `https://linkedin.com/in/${userDetail.sosmed.linkedin}`}
                    label="LinkedIn"
                    hideLabelOnMobile
                  />
                )}
                {userDetail.sosmed.instagram?.trim() && (
                  <SocialIcon
                    type="instagram"
                    href={userDetail.sosmed.instagram.startsWith('http')
                      ? userDetail.sosmed.instagram
                      : `https://instagram.com/${userDetail.sosmed.instagram}`}
                    label="Instagram"
                    hideLabelOnMobile
                  />
                )}
                {userDetail.sosmed.web?.trim() && (
                  <SocialIcon
                    type="web"
                    href={userDetail.sosmed.web.startsWith('http')
                      ? userDetail.sosmed.web
                      : `https://${userDetail.sosmed.web}`}
                    label="Website"
                    hideLabelOnMobile
                  />
                )}
                {userDetail.sosmed.discord?.trim() && (
                  <SocialIcon
                    type="discord"
                    label={userDetail.sosmed.discord}
                    alwaysShowLabel
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
