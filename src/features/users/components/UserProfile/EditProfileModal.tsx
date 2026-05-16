"use client"

import { useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  ImageIcon,
  Instagram,
  KeyRound,
  Linkedin,
  MessageCircle,
  PencilLine,
  Save,
  User,
} from "lucide-react"

import {
  BaseModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/shared/components"
import { Button, Input } from "@/shared/ui"
import { cn } from "@/shared/lib/utils"
import { SURFACE_GLASS_INPUT_CLASS } from "@/shared/styles"
import AuthProviders from "@/features/auth/components/AuthProviders"
import { isValidUsername } from "@/features/auth"
import {
  updateBio,
  updateProfilePicture,
  updateSosmed,
  updateUsername,
} from "@/features/users/services/user-profile.service"

type SocialLinks = {
  linkedin?: string
  instagram?: string
  discord?: string
  web?: string
}

type EditProfileModalProps = {
  userId: string
  currentUsername: string
  currentBio?: string
  currentProfilePictureUrl?: string
  currentSosmed?: SocialLinks
  onUsernameChange?: (username: string) => void
  onProfileChange?: (profile: {
    username: string
    bio: string
    profile_picture_url?: string | null
    sosmed: SocialLinks
  }) => void
  onSaved?: () => void
  triggerButtonClass?: string
  authInfo?: Array<{ provider: string; email: string }>
}

type ProfileFieldProps = {
  id: string
  label: string
  icon: LucideIcon
  value: string
  placeholder: string
  disabled: boolean
  maxLength: number
  autoComplete?: string
  type?: string
  onChange: (value: string) => void
}

const PROFILE_FIELD_LABEL_CLASS =
  "text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-200"

const PROFILE_FIELD_INPUT_CLASS =
  "relative z-0 h-12 rounded-xl bg-white/80 pl-10 pr-4 text-sm font-medium text-gray-950 placeholder:text-gray-400 hover:bg-white focus:bg-white dark:bg-[#111622]/85 dark:text-white dark:placeholder:text-gray-500 dark:hover:bg-[#141b2a] dark:focus:bg-[#141b2a]"

function ProfileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="shrink-0 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gray-200/80 dark:bg-gray-800/80" />
      </div>
      {children}
    </section>
  )
}

function ProfileField({
  id,
  label,
  icon: Icon,
  value,
  placeholder,
  disabled,
  maxLength,
  autoComplete = "off",
  type = "text",
  onChange,
}: ProfileFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className={PROFILE_FIELD_LABEL_CLASS}
      >
        {label}
      </label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-500 dark:text-gray-400 dark:group-focus-within:text-blue-400" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(SURFACE_GLASS_INPUT_CLASS, PROFILE_FIELD_INPUT_CLASS)}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />
      </div>
    </div>
  )
}

export default function EditProfileModal({
  userId,
  currentUsername,
  currentBio = "",
  currentProfilePictureUrl = "",
  currentSosmed = {},
  onUsernameChange,
  onProfileChange,
  onSaved,
  triggerButtonClass = "",
  authInfo = [],
}: EditProfileModalProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [bio, setBio] = useState(currentBio)
  const [profilePictureUrl, setProfilePictureUrl] = useState(currentProfilePictureUrl || "")
  const [sosmed, setSosmed] = useState<SocialLinks>(currentSosmed || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const usernameTrimmed = username.trim()
    const usernameError = isValidUsername(usernameTrimmed)
    if (usernameError) {
      setError(usernameError)
      setLoading(false)
      return
    }

    const { error: errUsername, username: newUsername } = await updateUsername(userId, usernameTrimmed)
    if (errUsername) {
      setError(errUsername)
      setLoading(false)
      return
    }

    setUsername(newUsername || username)
    onUsernameChange?.(newUsername || username)

    onProfileChange?.({
      username: newUsername || username,
      bio,
      profile_picture_url: profilePictureUrl.trim() || null,
      sosmed,
    })

    if (profilePictureUrl.trim() !== (currentProfilePictureUrl || "").trim()) {
      const { error: errPicture } = await updateProfilePicture(userId, profilePictureUrl)
      if (errPicture) {
        setError(errPicture)
        setLoading(false)
        return
      }
    }

    if (bio.trim() !== "") {
      const { error: errBio } = await updateBio(userId, bio)
      if (errBio) {
        setError(errBio)
        setLoading(false)
        return
      }
    }

    if (Object.values(sosmed).some((value) => value && value.trim() !== "")) {
      const { error: errSosmed } = await updateSosmed(userId, sosmed)
      if (errSosmed) {
        setError(errSosmed)
        setLoading(false)
        return
      }
    }

    setSuccess("Profile updated!")
    onSaved?.()
    setLoading(false)
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (value) {
      setError("")
      setSuccess("")
      setUsername(currentUsername)
      setBio(currentBio || "")
      setProfilePictureUrl(currentProfilePictureUrl || "")
      setSosmed(currentSosmed || {})
    }
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={handleOpenChange}
      size="2xl"
      contentClassName="h-auto max-h-[82vh]"
      trigger={
        <Button
          variant="outline"
          className={cn("h-9 gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wider text-gray-600 sm:h-10 sm:text-sm dark:text-gray-400", triggerButtonClass)}
        >
          <PencilLine size={14} aria-hidden="true" />
          Edit Profile
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          title={
            <span className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                <PencilLine size={17} />
              </span>
              Edit Profile
            </span>
          }
          description="Keep your handle, bio, and public links clean for the scoreboard."
          className="bg-white/80 px-4 py-3 dark:bg-[#0d1220]/90 md:px-5"
          titleClassName="text-lg font-black"
          descriptionClassName="text-xs"
        />

        <ModalBody className="space-y-4 px-4 py-4 md:px-5">
          <ProfileSection title="Profile">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileField
                id="edit-username"
                label="Username"
                icon={User}
                value={username}
                onChange={setUsername}
                placeholder="Username"
                disabled={loading}
                maxLength={32}
              />
              <ProfileField
                id="edit-profile-picture"
                label="Avatar URL"
                icon={ImageIcon}
                value={profilePictureUrl}
                onChange={setProfilePictureUrl}
                placeholder="https://..."
                disabled={loading}
                maxLength={512}
                type="url"
              />
              <div className="sm:col-span-2">
                <ProfileField
                  id="edit-bio"
                  label="Bio"
                  icon={MessageCircle}
                  value={bio}
                  onChange={setBio}
                  placeholder="Short player bio"
                  disabled={loading}
                  maxLength={200}
                />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Social Links">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileField
                id="edit-linkedin"
                label="LinkedIn"
                icon={Linkedin}
                value={sosmed.linkedin || ""}
                onChange={(value) => setSosmed((current) => ({ ...current, linkedin: value }))}
                placeholder="LinkedIn username/link"
                disabled={loading}
                maxLength={64}
              />
              <ProfileField
                id="edit-instagram"
                label="Instagram"
                icon={Instagram}
                value={sosmed.instagram || ""}
                onChange={(value) => setSosmed((current) => ({ ...current, instagram: value }))}
                placeholder="Instagram username/link"
                disabled={loading}
                maxLength={64}
              />
              <ProfileField
                id="edit-discord"
                label="Discord"
                icon={MessageCircle}
                value={sosmed.discord || ""}
                onChange={(value) => setSosmed((current) => ({ ...current, discord: value }))}
                placeholder="Discord username"
                disabled={loading}
                maxLength={64}
              />
              <ProfileField
                id="edit-web"
                label="Website"
                icon={Globe}
                value={sosmed.web || ""}
                onChange={(value) => setSosmed((current) => ({ ...current, web: value }))}
                placeholder="Website link"
                disabled={loading}
                maxLength={128}
              />
            </div>
          </ProfileSection>

          {authInfo.length > 0 ? (
            <ProfileSection title="Login Methods">
              <AuthProviders authInfo={authInfo} />
            </ProfileSection>
          ) : null}

          {error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="flex items-start gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-sm font-semibold text-green-600 dark:text-green-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="px-4 py-3 md:px-5" contentClassName="sm:justify-between">
          <Link
            href="/profile/password"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/60 px-3 text-sm font-semibold text-gray-600 shadow-sm backdrop-blur transition hover:border-blue-500/30 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-gray-800 dark:bg-[#111622]/60 dark:text-gray-300 dark:hover:text-blue-400"
          >
            <KeyRound size={15} />
            Change Password
          </Link>

          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
          >
            <Save size={15} />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </form>
    </BaseModal>
  )
}
