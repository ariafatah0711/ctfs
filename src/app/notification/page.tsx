"use client";
import { Suspense, useState } from "react";
import NotificationList from "./NotificationList";
import TitlePage from "@/components/custom/TitlePage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/custom/loading";
import { useNotifications } from '@/contexts/NotificationsContext'
import { Bell } from "lucide-react";

export default function NotificationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { markAllRead, refresh } = useNotifications()
  const [tabType, setTabType] = useState<'challenges' | 'solves'>('challenges')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    // when this page loads, mark all as read and refresh unread count
    if (!authLoading && user) {
      markAllRead()
      refresh()
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <TitlePage size="text-2xl" className="mb-6"><Bell className="inline-block mr-2" /> Notifications</TitlePage>

      {/* Tab buttons */}
      <div className="w-full grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setTabType('challenges')}
          className={`w-full px-3 py-1 text-sm rounded-md transition-colors ${tabType === 'challenges' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          Challenges
        </button>
        <button
          onClick={() => setTabType('solves')}
          className={`w-full px-3 py-1 text-sm rounded-md transition-colors ${tabType === 'solves' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        >
          Solves
        </button>
      </div>

      <Suspense fallback={<Loader fullscreen color="text-orange-500" />}>
        <NotificationList tabType={tabType} />
      </Suspense>
    </main>
  );
}
