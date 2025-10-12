"use client";
import { Suspense } from "react";
import NotificationList from "./NotificationList";
import TitlePage from "@/components/custom/TitlePage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/custom/loading";
import { useNotifications } from '@/contexts/NotificationsContext'

export default function NotificationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { markAllRead, refresh } = useNotifications()

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
      <TitlePage size="text-2xl" className="mb-6">🔔 Notifications</TitlePage>
      <Suspense fallback={<Loader fullscreen color="text-orange-500" />}>
        <NotificationList />
      </Suspense>
    </main>
  );
}
