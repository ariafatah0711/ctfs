"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getNotifications } from "@/lib/challenges";
import Link from "next/link";
import Loader from "@/components/custom/loading";
import { formatRelativeDate } from '@/lib/utils'

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

  if (loading) return <Loader fullscreen color="text-orange-500" />;

  if (notifications.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border rounded-lg px-4 py-6 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center text-center text-sm text-gray-600 dark:text-gray-300"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mb-3">
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <p className="font-medium text-gray-700 dark:text-gray-200">No notifications found</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">You’re all caught up!</p>
      </motion.div>
    );

  return (
    <ul className="space-y-2">
      {notifications.map((notif, idx) => (
        <motion.li
          key={idx}
          className="border rounded-lg px-4 py-3 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center gap-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.03 }}
        >
          {/* Icon */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 mr-2">
            {notif.notif_type === "new_challenge" ? (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 19V6" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            ) : (
              <span className="text-lg">🩸</span>
            )}
          </span>

          {/* Content */}
          <div className="flex-1 flex flex-wrap items-center gap-x-2">
            {notif.notif_type === "new_challenge" ? (
              <>
                <span className="font-semibold text-blue-600 dark:text-blue-300">New Challenge:</span>
                <span className="dark:text-gray-100 font-medium">{notif.notif_challenge_title}</span>
                <span className="text-gray-500 dark:text-gray-400">[{notif.notif_category}]</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-green-600 dark:text-green-300">First Blood</span>
                <span className="inline-flex items-center gap-1">
                  <Link
                    href={notif.notif_username ? `/user/${notif.notif_username}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1">
                      {notif.notif_username && notif.notif_username.length > 20
                        ? `${notif.notif_username.slice(0, 20)}...`
                        : notif.notif_username}
                    </span>
                  </Link>
                </span>
                <span className="text-gray-700 dark:text-gray-300">solved</span>
                <b className="dark:text-gray-100 font-medium">{notif.notif_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.notif_category}]</span>
              </>
            )}
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">
            {notif.notif_created_at ? formatRelativeDate(notif.notif_created_at) : ""}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
