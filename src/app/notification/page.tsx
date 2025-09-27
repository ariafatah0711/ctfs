
import { Suspense } from "react";
import NotificationList from "./NotificationList";
import TitlePage from "@/components/custom/TitlePage";

export default function NotificationPage() {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <TitlePage size="text-2xl" className="mb-6">🔔 Notifications</TitlePage>
      <Suspense fallback={<div>Loading...</div>}>
        <NotificationList />
      </Suspense>
    </main>
  );
}
