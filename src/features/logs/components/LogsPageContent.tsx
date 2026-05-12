"use client";

import { useState, useEffect } from "react";
import { Flag, Activity, LayoutDashboard, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from '@/shared/components';
import { EventSelect } from '@/shared/components/custom'
import { useEventContext, useAuth, useLogs } from '@/shared/contexts'
import LogsList from "@/features/logs/components/LogsList";
import { motion } from "framer-motion";

export default function LogsPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { markAllRead, refresh } = useLogs()
  const [tabType, setTabType] = useState<'challenges' | 'solves'>('solves')
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user) {
      refresh()
    }
  }, [authLoading, user, router, refresh]);

  useEffect(() => {
    if (tabType === 'challenges' && user) {
      markAllRead(selectedEvent)
    }
  }, [tabType, user, markAllRead, selectedEvent]);

  if (authLoading) return <Loader fullscreen color="text-blue-500" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-orange-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        {/* Compact Navigation Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Event Filter */}
          <div className="flex items-center gap-3">
            <EventSelect
              value={selectedEvent}
              onChange={setSelectedEvent}
              events={startedEvents as any}
              className="min-w-[180px] bg-white/60 dark:bg-[#111622]/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl text-sm px-4 py-2 shadow-sm transition-all hover:border-blue-500/30"
              getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 gap-1 bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 backdrop-blur-sm rounded-2xl">
            <TabButton
              active={tabType === 'solves'}
              onClick={() => setTabType('solves')}
              icon={<Target size={16} />}
              label="Solves Feed"
            />
            <TabButton
              active={tabType === 'challenges'}
              onClick={() => setTabType('challenges')}
              icon={<Flag size={16} />}
              label="Challenge Info"
            />
          </div>
        </div>

        <motion.div
          key={`${tabType}-${selectedEvent}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LogsList tabType={tabType} eventId={selectedEvent} />
        </motion.div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active
        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
