import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { AuditLogEntry } from '@/lib/log'
import { getAuditLogs } from '@/lib/log'
import { formatRelativeDate } from '@/lib/utils'
import Loader from '@/components/custom/loading'

interface AuditLogListProps {
  // If `logs` is provided by the parent, the component will display them.
  // If not provided, the component will fetch logs itself using `getAuditLogs`.
  logs?: AuditLogEntry[]
  isLoading?: boolean
}

type ActionType = 'login' | 'logout' | 'user_signedup' | 'user_deleted' | 'token_refreshed'

const ACTION_OPTIONS: { value: ActionType, label: string }[] = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'user_signedup', label: 'Sign Up' },
  { value: 'user_deleted', label: 'Deleted' },
  { value: 'token_refreshed', label: 'Session Renewed' },
]

const getActionStyle = (action: string): { color: string, icon: string } => {
  switch (action) {
    case 'login': return { color: 'text-green-600 dark:text-green-400', icon: '→' }
    case 'logout': return { color: 'text-yellow-600 dark:text-yellow-400', icon: '←' }
    case 'user_signedup': return { color: 'text-blue-600 dark:text-blue-400', icon: '+' }
    case 'user_deleted': return { color: 'text-red-600 dark:text-red-400', icon: '×' }
    case 'token_refreshed': return { color: 'text-purple-600 dark:text-purple-400', icon: '⟲' }
    default: return { color: 'text-gray-600 dark:text-gray-400', icon: '•' }
  }
}

const formatAction = (action: string) => {
  // Jika action adalah token_refreshed, tampilkan sebagai "Session Renewed"
  if (action === 'token_refreshed') {
    return 'Session Renewed'
  }
  return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

const AuditLogList: React.FC<AuditLogListProps> = ({ logs, isLoading }) => {
  const [selectedActions, setSelectedActions] = React.useState<ActionType[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')

  // Internal state used when parent didn't pass `logs`.
  const [internalLogs, setInternalLogs] = React.useState<AuditLogEntry[]>([])
  const [internalLoading, setInternalLoading] = React.useState(false)
  const [limit, setLimit] = React.useState<number>(50)

  const toggleAction = (action: ActionType) => {
    setSelectedActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    )
  }

  // Determine source of logs and loading state: prefer props passed from parent,
  // otherwise use our internal fetch state.
  const sourceLogs = React.useMemo(() => (logs ? logs : internalLogs), [logs, internalLogs])
  const loadingState = isLoading ?? internalLoading

  // Fetch logs when the component is mounted or when `limit` changes, but only
  // if parent did not provide `logs`.
  React.useEffect(() => {
    let mounted = true

    const fetchLogs = async () => {
      if (logs) return // parent provided logs; don't fetch
      try {
        setInternalLoading(true)
        const data = await getAuditLogs(limit)
        if (!mounted) return
        setInternalLogs(data || [])
      } catch (err) {
        console.error('Error fetching audit logs in component:', err)
        if (mounted) setInternalLogs([])
      } finally {
        if (mounted) setInternalLoading(false)
      }
    }

    fetchLogs()

    return () => { mounted = false }
  }, [limit, logs])

const filteredLogs = React.useMemo(() => {
  return sourceLogs.filter(log => {
    // Skip token_revoked entries entirely
    if (log.payload.action === 'token_revoked') {
      return false
    }

    const matchesAction =
      selectedActions.length === 0 || selectedActions.includes(log.payload.action as ActionType)

    const email = log.payload.action === 'user_deleted'
      ? log.payload.traits?.user_email
      : log.payload.actor_username

    const matchesSearch =
      !searchQuery || email?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesAction && matchesSearch
  })
}, [sourceLogs, selectedActions, searchQuery])

  if (loadingState) {
    return (
      <Card className="bg-white dark:bg-gray-800 pt-5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader color="text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-lg font-semibold">Recent Audit Logs</CardTitle>

        {/* Limit selector (50/250/1000) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="appearance-none text-xs px-3 py-1.5 pr-8 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value={50}>Last 50</option>
              <option value={100}>Last 100</option>
              <option value={250}>Last 250</option>
              <option value={500}>Last 500</option>
              <option value={1000}>Last 1000</option>
              <option value={2500}>Last 2500</option>
              <option value={5000}>Last 5000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter controls */}
        <div className="flex flex-col gap-3">
          {/* Multi-select checkboxes */}
          <div className="flex flex-wrap gap-2">
            {ACTION_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  selectedActions.includes(opt.value)
                    ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedActions.includes(opt.value)}
                  onChange={() => toggleAction(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by email..."
              className="text-sm px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent flex-1"
            />

            {/* Stats */}
              <div className="text-xs text-gray-500">
              {filteredLogs.length} of {sourceLogs.length} logs
              {searchQuery && <span className="ml-1">matching &quot;{searchQuery}&quot;</span>}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <div className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
          {filteredLogs.map((log, idx) => {
            const isUserDeleted = log.payload.action === 'user_deleted'
            const userEmail = isUserDeleted ? log.payload.traits?.user_email : log.payload.actor_username
            const style = getActionStyle(log.payload.action)

            return (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-2 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className={`${style.color} font-bold text-base`}>{style.icon}</span>
                    <span className={`${style.color} text-xs font-medium`}>{formatAction(log.payload.action)}</span>
                  </div>

                  <span className="truncate text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{userEmail}</span>

                  {log.payload.traits?.provider && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {log.payload.traits.provider}
                    </span>
                  )}

                  <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                    {formatRelativeDate(log.created_at)}
                  </span>
                </div>

                {isUserDeleted && log.payload.traits?.user_id && (
                  <div className="pl-8 mt-1 text-xs font-mono text-gray-400">
                    ID: {log.payload.traits.user_id.slice(0,8)}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default AuditLogList
