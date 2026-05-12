"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Loader as LucideLoader,
  Flag,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Target
} from "lucide-react";

import { Loader } from '@/shared/components';
import { formatRelativeDate } from '@/shared/lib'
import { useLogs } from '@/shared/contexts';
import { Button } from "@/shared/ui";

export type LogEntry = {
  log_type: "new_challenge" | "first_blood" | "solve";
  log_challenge_id: string;
  log_challenge_title: string;
  log_category: string;
  log_user_id?: string;
  log_username?: string;
  log_created_at: string;
};

export default function LogsList({
  tabType = 'challenges',
  eventId
}: {
  tabType?: 'challenges' | 'solves',
  eventId?: string | null | 'all'
}) {
  const [notifications, setNotifications] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);
  const { getFeed } = useLogs()

  const eventKey = eventId === undefined ? 'any' : (eventId === null ? 'main' : String(eventId))
  const cacheKey = `${tabType}:${eventKey}`

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const merged = await getFeed(tabType, eventId)
        setNotifications(merged);
        setVisibleCount(50); // Reset count on new data
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [cacheKey, getFeed, tabType, eventId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader color="text-blue-500" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">
          Retrieving intelligence...
        </p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20"
      >
        <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Clock className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Silence in the Wire</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs mt-2">
          No activities recorded for this period. Stay tuned for incoming signals.
        </p>
      </motion.div>
    );
  }

  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMore = visibleCount < notifications.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notif, index) => (
            <LogItem key={`${notif.log_challenge_id}-${notif.log_created_at}-${index}`} notif={notif} />
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setVisibleCount(prev => prev + 50)}
            variant="outline"
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#111622]/50 backdrop-blur-sm px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:border-blue-500/50 hover:text-blue-500 transition-all shadow-sm"
          >
            Load More Intelligence ({notifications.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

function LogItem({ notif }: { notif: LogEntry }) {
  const getLogTypeDetails = (type: LogEntry["log_type"]) => {
    switch (type) {
      case "new_challenge":
        return {
          icon: <Flag size={18} />,
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-100 dark:border-blue-900/30",
          label: "New Challenge"
        };
      case "first_blood":
        return {
          icon: <Sparkles size={18} />,
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-100 dark:border-red-900/30",
          label: "First Blood"
        };
      case "solve":
        return {
          icon: <CheckCircle2 size={18} />,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          borderColor: "border-emerald-100 dark:border-emerald-900/30",
          label: "Solved"
        };
      default:
        return {
          icon: <Target size={18} />,
          color: "text-gray-500",
          bgColor: "bg-gray-50 dark:bg-gray-800",
          borderColor: "border-gray-100 dark:border-gray-800",
          label: "Activity"
        };
    }
  };

  const details = getLogTypeDetails(notif.log_type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: 4 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-[#111622]/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="flex items-center gap-4">
        {/* Type Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${details.bgColor} ${details.color} ${details.borderColor} border shadow-sm transition-transform group-hover:scale-110`}>
          {details.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${details.color}`}>
              {details.label}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock size={10} />
              {formatRelativeDate(notif.log_created_at)}
            </span>
          </div>

          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {notif.log_type === 'new_challenge' ? (
              <span>
                <span className="text-blue-600 dark:text-blue-400">[{notif.log_category}]</span> {notif.log_challenge_title} has been deployed.
              </span>
            ) : notif.log_type === 'first_blood' ? (
              <span>
                <Link href={`/user/${encodeURIComponent(notif.log_username || '')}`} className="hover:text-red-500 transition-colors">
                  {notif.log_username}
                </Link> secured first blood on <span className="text-red-500 font-black">{notif.log_challenge_title}</span>!
              </span>
            ) : (
              <span>
                <Link href={`/user/${encodeURIComponent(notif.log_username || '')}`} className="hover:text-emerald-500 transition-colors">
                  {notif.log_username}
                </Link> solved <span className="font-bold text-gray-700 dark:text-gray-300">{notif.log_challenge_title}</span>.
              </span>
            )}
          </h4>
        </div>

        {/* Action / Link */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/challenges?id=${notif.log_challenge_id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Decorative hover effect */}
      <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-${details.color.split('-')[1]}-500 to-transparent transition-all duration-500 group-hover:w-full`} />
    </motion.div>
  );
}
