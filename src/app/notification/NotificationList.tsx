"use client";
import { useEffect, useState } from "react";
import { getNotifications } from "@/lib/challenges";

export type Notification = {
  notif_type: "new_challenge" | "first_blood";
  notif_challenge_id: string;
  notif_challenge_title: string;
  notif_category: string;
  notif_user_id?: string;
  notif_username?: string;
  notif_created_at: string;
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const notifs = await getNotifications();
      setNotifications(notifs);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (notifications.length === 0) return <div>No notifications found.</div>;

  return (
    <ul className="space-y-4">
      {notifications.map((notif, idx) => (
  <li key={idx} className="border rounded px-3 py-2 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center text-sm">
          {notif.notif_type === "new_challenge" ? (
            <>
              <span className="font-semibold text-blue-600 dark:text-blue-300 mr-1">New Challenge:</span>
              <span className="dark:text-gray-100 mr-1">{notif.notif_challenge_title}</span>
              <span className="text-gray-500 dark:text-gray-400 mr-1">[{notif.notif_category}]</span>
              <span className="text-gray-400 dark:text-gray-500 ml-auto">{notif.notif_created_at ? new Date(notif.notif_created_at).toLocaleString() : ""}</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-green-600 dark:text-green-300 mr-1">First Blood 🩸:</span>
              <span className="dark:text-gray-100 mr-1">{notif.notif_username}</span>
              <span className="text-gray-700 dark:text-gray-300 mr-1">solved</span>
              <b className="dark:text-gray-100 mr-1">{notif.notif_challenge_title}</b>
              <span className="text-gray-500 dark:text-gray-400 mr-1">[{notif.notif_category}]</span>
              <span className="text-gray-400 dark:text-gray-500 ml-auto">{notif.notif_created_at ? new Date(notif.notif_created_at).toLocaleString() : ""}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
