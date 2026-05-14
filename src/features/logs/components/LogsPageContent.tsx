"use client";

import { useState, useEffect } from "react";
import { Flag, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from '@/shared/components';
import PageBackground from '@/shared/components/PageBackground'
import { SegmentedTabs } from '@/shared/components'
import EventSelect from '@/features/events/components/EventSelect'
import { useAuth } from '@/shared/contexts'
import { useEventContext } from '@/features/events/contexts/EventContext'
import { useLogs } from '@/features/logs/contexts/LogsContext'
import LogsList from "@/features/logs/components/LogsList";
import { motion } from "framer-motion";
import { PAGE_MAIN_CONTAINER_4XL } from '@/shared/styles'

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
    <PageBackground
      selectionClassName="selection:bg-orange-500/30"
      contentClassName={`${PAGE_MAIN_CONTAINER_4XL} space-y-6`}
    >
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
          <SegmentedTabs
            items={[
              { value: 'solves', label: 'Solves Feed', icon: Target },
              { value: 'challenges', label: 'Challenge Info', icon: Flag },
            ]}
            value={tabType}
            onChange={setTabType}
            variant="panelLarge"
          />
        </div>

        <motion.div
          key={`${tabType}-${selectedEvent}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LogsList tabType={tabType} eventId={selectedEvent} />
        </motion.div>
    </PageBackground>
  );
}
