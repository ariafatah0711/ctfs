"use client";

// React Imports
import { useState } from "react";
import Link from "next/link";

// Shared Imports
import {
  AuthProviders,
  BaseModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/shared/components/custom";
import { Input, Button } from "@/shared/ui";
import { updateUsername, updateBio, updateSosmed, updateProfilePicture } from "@/shared/lib";
import { isValidUsername } from "@/features/auth";

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
  authInfo = []
}: {
  userId: string;
  currentUsername: string;
  currentBio?: string;
  currentProfilePictureUrl?: string;
  currentSosmed?: { linkedin?: string; instagram?: string; discord?: string; web?: string };
  onUsernameChange?: (username: string) => void;
  onProfileChange?: (profile: {
    username: string;
    bio: string;
    profile_picture_url?: string | null;
    sosmed: { linkedin?: string; instagram?: string; discord?: string; web?: string };
  }) => void;
  onSaved?: () => void;
  triggerButtonClass?: string;
  authInfo?: Array<{ provider: string; email: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
  const [profilePictureUrl, setProfilePictureUrl] = useState(currentProfilePictureUrl || "");
  const [sosmed, setSosmed] = useState<{ linkedin?: string; instagram?: string; discord?: string; web?: string }>(
    currentSosmed || {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // Username
    const usernameTrimmed = username.trim();
    const usernameError = isValidUsername(usernameTrimmed);
    if (usernameError) {
      setError(usernameError);
      setLoading(false);
      return;
    }
    // Update username
    const { error: errUsername, username: newUsername } = await updateUsername(userId, usernameTrimmed);
    if (errUsername) {
      setError(errUsername);
      setLoading(false);
      return;
    }

    setUsername(newUsername || username);
    onUsernameChange?.(newUsername || username);

    // Call onProfileChange with all updated data
    onProfileChange?.({
      username: newUsername || username,
      bio,
      profile_picture_url: profilePictureUrl.trim() || null,
      sosmed,
    });

    // Update profile picture URL (allow clearing)
    if (profilePictureUrl.trim() !== (currentProfilePictureUrl || '').trim()) {
      const { error: errPicture } = await updateProfilePicture(userId, profilePictureUrl);
      if (errPicture) {
        setError(errPicture);
        setLoading(false);
        return;
      }
    }

    // Update bio
    if (bio.trim() !== "") {
      const { error: errBio } = await updateBio(userId, bio);
      if (errBio) {
        setError(errBio);
        setLoading(false);
        return;
      }
    }

    // Update sosmed
    if (Object.values(sosmed).some((v) => v && v.trim() !== "")) {
      const { error: errSosmed } = await updateSosmed(userId, sosmed);
      if (errSosmed) {
        setError(errSosmed);
        setLoading(false);
        return;
      }
    }

    setSuccess("Profile updated!");
    onSaved?.();
    setLoading(false);
  };

  // Reset fields to current values when modal opened
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setError("");
      setSuccess("");
      setUsername(currentUsername);
      setBio(currentBio || "");
      setProfilePictureUrl(currentProfilePictureUrl || "");
      setSosmed(currentSosmed || {});
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={handleOpenChange}
      size="2xl"
      trigger={<Button className={triggerButtonClass}>Edit Profile</Button>}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          title="Edit Profile"
          description="Update your profile info below."
        />

        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Username
              </label>
              <Input
                id="edit-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={loading}
                className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                autoComplete="off"
                maxLength={32}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Bio
              </label>
              <Input
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio (deskripsi singkat)"
                disabled={loading}
                className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                maxLength={200}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-profile-picture" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Profile Picture URL (optional)
              </label>
              <Input
                id="edit-profile-picture"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://..."
                disabled={loading}
                className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                maxLength={512}
              />
            </div>

            <div className="space-y-2">
              <div className="mb-1 mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Sosial Media</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="edit-linkedin" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                    LinkedIn
                  </label>
                  <Input
                    id="edit-linkedin"
                    value={sosmed.linkedin || ""}
                    onChange={(e) => setSosmed((s) => ({ ...s, linkedin: e.target.value }))}
                    placeholder="LinkedIn username/link"
                    disabled={loading}
                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    maxLength={64}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-instagram" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Instagram
                  </label>
                  <Input
                    id="edit-instagram"
                    value={sosmed.instagram || ""}
                    onChange={(e) => setSosmed((s) => ({ ...s, instagram: e.target.value }))}
                    placeholder="Instagram username/link"
                    disabled={loading}
                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    maxLength={64}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-discord" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Discord
                  </label>
                  <Input
                    id="edit-discord"
                    value={sosmed.discord || ""}
                    onChange={(e) => setSosmed((s) => ({ ...s, discord: e.target.value }))}
                    placeholder="Discord username#tag"
                    disabled={loading}
                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    maxLength={64}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-web" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Website
                  </label>
                  <Input
                    id="edit-web"
                    value={sosmed.web || ""}
                    onChange={(e) => setSosmed((s) => ({ ...s, web: e.target.value }))}
                    placeholder="Website link"
                    disabled={loading}
                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    maxLength={128}
                  />
                </div>
              </div>
            </div>

            <AuthProviders authInfo={authInfo} />

            {error ? (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {success}
              </div>
            ) : null}
          </div>
        </ModalBody>

        <ModalFooter contentClassName="sm:justify-between">
          <Link href="/profile/password" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
            Change Password
          </Link>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 sm:w-auto"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </ModalFooter>
      </form>
    </BaseModal>
  );
}
