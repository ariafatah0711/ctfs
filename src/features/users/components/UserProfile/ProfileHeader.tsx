'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock3 } from 'lucide-react'
import { ImageWithFallback, EventSelect } from '@/shared/components'
import { SocialIcon } from '@/shared/components/custom'
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
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-start md:justify-between"
    >
      <div className="flex w-full flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <ImageWithFallback
          src={avatarSrc}
          alt={userDetail.username}
          size={120}
          className="rounded-full border-4 border-white object-cover shadow-md dark:border-gray-900"
          fallbackBg="bg-blue-500/10"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2 text-center sm:text-left">
          <h1
            className="max-w-full truncate text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
            title={userDetail.username}
          >
            {userDetail.username}
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            {userDetail.bio?.trim() || 'CTF player on NXCTF'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:justify-start sm:flex-nowrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/50 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-gray-900/40">
              <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
              Joined {userDetail.created_at ? formatRelativeDate(userDetail.created_at) : '-'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/50 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-gray-900/40">
              <Clock3 className="h-3.5 w-3.5 text-blue-500" />
              Last login {userDetail.last_login_at ? formatRelativeDate(userDetail.last_login_at) : 'Never'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-3 md:w-auto md:items-end">
        <div className="flex w-full flex-col gap-2 sm:w-[220px]">
          {isCurrentUser && (
            <EditProfileModal
              userId={userDetail.id}
              currentUsername={userDetail.username}
              currentBio={userDetail.bio || ''}
              currentProfilePictureUrl={userDetail.profile_picture_url || ''}
              currentSosmed={userDetail.sosmed || {}}
              onUsernameChange={username => onUpdateUserDetail({ ...userDetail, username })}
              onProfileChange={({ username, bio, sosmed, profile_picture_url }) => {
                const nextProfileUrl = profile_picture_url ?? userDetail.profile_picture_url ?? null
                const isGooglePicture = !!userDetail.picture && userDetail.picture !== userDetail.profile_picture_url
                const nextPicture = isGooglePicture
                  ? userDetail.picture
                  : (nextProfileUrl || null)
                onUpdateUserDetail({
                  ...userDetail,
                  username,
                  bio,
                  sosmed,
                  profile_picture_url: nextProfileUrl,
                  picture: nextPicture,
                })
              }}
              onSaved={refreshUserDetail}
              triggerButtonClass="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:bg-blue-700 hover:shadow-blue-500/30 dark:bg-blue-500 dark:hover:bg-blue-400"
              authInfo={authInfo}
            />
          )}

          <EventSelect
            value={effectiveSelectedEvent}
            onChange={setSelectedEvent}
            events={profileEvents as any}
            showMain={showMainOption}
                   className="sm:min-w-[180px] md:w-[220px]"
            getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
          />
        </div>

        {userDetail.sosmed && (
          <div className="flex flex-nowrap items-center justify-center gap-2 md:justify-end">
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
    </motion.section>
  )
}
