"use client";

import { useState } from "react";
import { updateUsername, updateBio, updateSosmed } from "@/lib/users";
import { bindGoogleManual, unbindGoogleManual } from '@/lib/auth'
import { isValidUsername } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DIALOG_CONTENT_CLASS } from "@/styles/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthProviders from "@/components/custom/AuthProviders";
import Link from "next/link";

export default function EditProfileModal({
  userId,
  currentUsername,
  currentBio = "",
  currentSosmed = {},
  onUsernameChange,
  onProfileChange,
  triggerButtonClass = "",
  authInfo = []
}: {
  userId: string;
  currentUsername: string;
  currentBio?: string;
  currentSosmed?: { linkedin?: string; instagram?: string; discord?: string; web?: string };
  onUsernameChange?: (username: string) => void;
  onProfileChange?: (profile: {
    username: string;
    bio: string;
    sosmed: { linkedin?: string; instagram?: string; discord?: string; web?: string };
  }) => void;
  triggerButtonClass?: string;
  authInfo?: Array<{ provider: string; email: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
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
      sosmed,
    });

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
    setLoading(false);
  };

  // Reset fields to current values when modal opened
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setUsername(currentUsername);
      setBio(currentBio || "");
      setSosmed(currentSosmed || {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={triggerButtonClass}>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent
        className={
          DIALOG_CONTENT_CLASS +
          " [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white"
        }
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-300">Update your username below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-2 mb-1">Sosial Media</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  maxLength={128}
                />
              </div>
            </div>
          </div>
          <AuthProviders authInfo={authInfo} />
          {error && <div className="text-red-500 dark:text-red-400 text-sm text-center font-semibold">{error}</div>}
          {success && <div className="text-green-600 dark:text-green-400 text-sm text-center font-semibold">{success}</div>}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>

        <div className="text-center mt-2">
          <Link href="/profile/password" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
            Change Password
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
