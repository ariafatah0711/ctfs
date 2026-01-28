"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLogs, getRecentSolves } from "@/lib/challenges";
import { useLogs } from '@/contexts/LogsContext'
import Link from "next/link";
import Loader from "@/components/custom/loading";
import { formatRelativeDate } from '@/lib/utils'

export type LogEntry = {
  log_type: "new_challenge" | "first_blood" | "solve";
  log_challenge_id: string;
  log_challenge_title: string;
  log_category: string;
  log_user_id?: string;
  log_username?: string;
  log_created_at: string;
};

export default function LogsList({ tabType = 'challenges', eventId }: { tabType?: 'challenges' | 'solves', eventId?: string | null | 'all' }) {
  const [notifications, setNotifications] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { getEventChallengeIds } = useLogs()

  useEffect(() => {
    (async () => {
      setLoading(true);
      // fetch logs + recent solves
      const notifs = await getLogs(10000, 0);
      const solves = await getRecentSolves(100, 0);

      // If eventId is provided and not 'all', get cached challenge ids for that event
      let eventChallengeIds: Set<string> | null = null;
      if (eventId !== undefined && eventId !== 'all') {
        try {
          const set = await getEventChallengeIds(eventId as any)
          eventChallengeIds = set
        } catch (err) {
          eventChallengeIds = null
        }
      }

      // Merge and sort by created_at (newest first)
      let merged = [...notifs, ...solves]
        .sort((a, b) => new Date(b.log_created_at).getTime() - new Date(a.log_created_at).getTime());

      // If we have an event filter, keep only notifications/solves whose challenge id belongs to the event
      if (eventChallengeIds) {
        merged = merged.filter((n) => eventChallengeIds!.has(String(n.log_challenge_id)));
      }

      setNotifications(merged);
      setLoading(false);
    })();
  }, [eventId, getEventChallengeIds]);

  // Filter based on tab type
  const challengeLogs = notifications.filter(n => n.log_type === 'first_blood' || n.log_type === 'new_challenge');
  const solveLogs = notifications.filter(n => n.log_type === 'solve');
  const filteredNotifications = tabType === 'solves' ? solveLogs : challengeLogs;

  if (loading) return <Loader fullscreen color="text-orange-500" />;

  if (filteredNotifications.length === 0)
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
        <p className="font-medium text-gray-700 dark:text-gray-200">No logs found</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">You’re all caught up!</p>
      </motion.div>
    );

  return (
    <ul className="space-y-2">
      {filteredNotifications.map((notif, idx) => (
        <motion.li
          key={idx}
          className="border rounded-lg px-4 py-3 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center gap-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.0003 }}
        >
          {/* Icon */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 mr-2">
            {notif.log_type === "new_challenge" ? (
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
            ) : notif.log_type === "first_blood" ? (
              <span className="text-lg">🩸</span>
            ) : (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>

          {/* Content */}
          <div className="flex-1 flex flex-wrap items-center gap-x-2">
            {notif.log_type === "new_challenge" ? (
              <>
                <span className="font-semibold text-blue-600 dark:text-blue-300">New Challenge:</span>
                <span className="dark:text-gray-100 font-medium max-w-[300px] truncate inline-block">{notif.log_challenge_title}</span>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            ) : notif.log_type === "first_blood" ? (
              <>
                <span className="font-semibold text-green-600 dark:text-green-300">First Blood</span>
                <span className="inline-flex items-center gap-1">
                  <Link
                    href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1 max-w-[300px] truncate">
                      {notif.log_username && notif.log_username.length > 20
                        ? `${notif.log_username.slice(0, 20)}...`
                        : notif.log_username}
                    </span>
                  </Link>
                </span>
                <span className="text-gray-700 dark:text-gray-300">solved</span>
                <b className="dark:text-gray-100 font-medium max-w-[300px] truncate inline-block">{notif.log_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 max-w-[300px] truncate">
                  <Link
                    href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1 max-w-[300px] truncate">
                      {notif.log_username && notif.log_username.length > 20
                        ? `${notif.log_username.slice(0, 20)}...`
                        : notif.log_username}
                    </span>
                  </Link>
                </span>
                <span className="text-gray-700 dark:text-gray-300">solved</span>
                <b className="dark:text-gray-100 font-medium max-w-[300px] truncate inline-flex">{notif.log_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            )}
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">
            {notif.log_created_at ? formatRelativeDate(notif.log_created_at) : ""}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
