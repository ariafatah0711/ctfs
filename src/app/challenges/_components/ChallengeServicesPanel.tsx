"use client"

import React, { useEffect, useState } from 'react'
import { Clock, Loader2, Play, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'

type ServiceAction = 'up' | 'restart' | 'extend'

interface ChallengeServicesPanelProps {
  open: boolean
  services?: string[]
}

const ChallengeServicesPanel: React.FC<ChallengeServicesPanelProps> = ({
  open,
  services = [],
}) => {
  const [serviceDetails, setServiceDetails] = useState<Record<string, any>>({})
  const [serviceDetailsFetchTime, setServiceDetailsFetchTime] = useState<Record<string, number>>({})
  const [serviceActionLoading, setServiceActionLoading] = useState<Record<string, boolean>>({})
  const [nowTick, setNowTick] = useState<number>(() => Date.now())

  useEffect(() => {
    if (!open || services.length === 0) return

    services.forEach(async (service) => {
      try {
        const res = await fetch(`/api/nxctl?action=inspect&name=${service}`)
        const data = await res.json()
        if (res.ok) {
          setServiceDetails((prev) => ({ ...prev, [service]: data }))
          setServiceDetailsFetchTime((prev) => ({ ...prev, [service]: Date.now() }))
        }
      } catch (error) {
        console.error(`Failed to fetch service details for ${service}`, error)
      }
    })
  }, [open, services])

  // global ticking state to re-render countdowns every second while panel is open
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])

  const inspectService = async (service: string) => {
    try {
      const resInspect = await fetch(`/api/nxctl?action=inspect&name=${service}`)
      if (resInspect.ok) {
        const dataInspect = await resInspect.json()
        setServiceDetails((prev) => ({ ...prev, [service]: dataInspect }))
        setServiceDetailsFetchTime((prev) => ({ ...prev, [service]: Date.now() }))
      }
    } catch (error) {
      console.error(`Failed to refresh service details for ${service}`, error)
    }
  }

  const handleServiceAction = async (service: string, action: ServiceAction) => {
    setServiceActionLoading((prev) => ({ ...prev, [service]: true }))
    const toastId = toast.loading(`${action}ing ${service}...`)

    try {
      const res = await fetch('/api/nxctl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, name: service }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(`Successfully ${action}ed ${service}`, { id: toastId })
        // Add small delay then refresh to let backend settle
        setTimeout(() => inspectService(service), 500)
      } else {
        toast.error(`Failed to ${action} ${service}: ${data.error || data.detail || 'Unknown error'}`, { id: toastId })
      }
    } catch (error) {
      console.error(`Failed to ${action} ${service}`, error)
      toast.error(`Error ${action}ing ${service}`, { id: toastId })
    } finally {
      setServiceActionLoading((prev) => ({ ...prev, [service]: false }))
    }
  }

  function formatMinutes(sec?: number | null) {
    if (!sec || sec <= 0) return null

    const mins = Math.ceil(sec / 60)

    return `${mins}m`
  }

  if (services.length === 0) return null

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1 inline-flex items-center gap-1 uppercase tracking-wider">
        <span className="h-3.5 w-3.5">🌐</span> NXCTL Services
      </p>
      <div className="grid grid-cols-1 gap-1.5">
        {services.map((service, idx) => {
          const details = serviceDetails[service]
          const isRunning = details?.runtime?.status === 'running'
          const activeExport = details?.exports?.[0]
          const endpoint = activeExport?.endpoint || ''
          const isTcp = details?.challenge?.type === 'tcp'

          // Use remaining_seconds directly from API, calculate expires_at for display
          const remainingSecFromApi = details?.runtime?.remaining_seconds ?? null
          const fetchTime = serviceDetailsFetchTime[service] ?? nowTick
          const timeSinceFetch = Math.max(0, (nowTick - fetchTime) / 1000)
          const remainingSec = remainingSecFromApi !== null ? Math.max(0, remainingSecFromApi - timeSinceFetch) : null
          const expiresAtMs = remainingSec !== null ? nowTick + remainingSec * 1000 : null
          const restartCooldownSec = typeof details?.runtime?.restart_cooldown === 'number' ? details.runtime.restart_cooldown : (details?.runtime?.restart_cooldown ? Number(details.runtime.restart_cooldown) : 0)

          // Use backend's extend_availability data
          const extendAvailability = details?.runtime?.extend
          const thresholdSec = extendAvailability?.threshold_seconds || 300 // fallback to 5 minutes
          const canExtend = extendAvailability?.can_extend || false

          const formatSecs = (s: number) => {
            if (s <= 0) return '0s'
            const h = Math.floor(s / 3600)
            const m = Math.floor((s % 3600) / 60)
            const sec = s % 60
            if (h > 0) return `${h}h ${m}m ${sec}s`
            return `${m}m ${sec}s`
          }

          const remainingClass = (() => {
            if (remainingSec === null) return 'text-gray-500'
            if (remainingSec <= 60) return 'text-red-400 font-semibold'
            if (remainingSec <= thresholdSec) return 'text-yellow-400 font-medium'
            return 'text-gray-400'
          })()

          let displayUrl = ''
          let ncCommand = ''

          if (isRunning && endpoint) {
            if (isTcp) {
              const match = endpoint.match(/tcp:\/\/(.*):(\d+)/)
              if (match) {
                ncCommand = `nc ${match[1]} ${match[2]}`
              } else {
                ncCommand = endpoint
              }
            } else {
              displayUrl = endpoint
            }
          }

          return (
            <div key={idx} className="flex flex-col gap-1.5 bg-[#1a1a33]/80 p-2.5 rounded border border-[#35355e] group hover:border-cyan-500/50 transition-colors shadow-sm">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-cyan-300 break-all flex-1">{service}</code>
                <button
                  type="button"
                  className="p-1.5 bg-[#232344] hover:bg-[#35355e] rounded text-gray-400 hover:text-green-400 transition shadow-sm disabled:opacity-50"
                  onClick={() => handleServiceAction(service, 'up')}
                  title="Start Service"
                  disabled={serviceActionLoading[service] || isRunning}
                >
                  {serviceActionLoading[service] ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                </button>
                <button
                  type="button"
                  className="p-1.5 bg-[#232344] hover:bg-[#35355e] rounded text-gray-400 hover:text-yellow-400 transition shadow-sm disabled:opacity-50 flex items-center gap-1"
                  onClick={() => handleServiceAction(service, 'restart')}
                  title={(() => {
                    if (serviceActionLoading[service]) return 'Please wait...'
                    if (!isRunning) return 'Cannot restart: service is not running'
                    if (restartCooldownSec && restartCooldownSec > 0) return `Restart cooldown: ${formatSecs(restartCooldownSec)}`
                    return 'Restart Service'
                  })()}
                  disabled={serviceActionLoading[service] || !isRunning || (restartCooldownSec && restartCooldownSec > 0)}
                >
                  {serviceActionLoading[service] ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                  {formatMinutes(restartCooldownSec) && (
                    <span className="text-[10px] text-yellow-300 font-semibold">
                      {formatMinutes(restartCooldownSec)}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="p-1.5 bg-[#232344] hover:bg-[#35355e] rounded text-gray-400 hover:text-blue-400 transition shadow-sm disabled:opacity-50 flex items-center gap-1"
                  onClick={() => handleServiceAction(service, 'extend')}
                  title={(() => {
                    if (serviceActionLoading[service]) return 'Please wait...'
                    if (!isRunning) return 'Cannot extend: service is not running'
                    if (!remainingSec) return 'No expiration available to extend'
                    if (!canExtend) {
                      if (extendAvailability?.cooldown_remaining_seconds && extendAvailability.cooldown_remaining_seconds > 0) {
                        return `Extend cooldown: ${formatSecs(extendAvailability.cooldown_remaining_seconds)}`
                      }
                      return `Can extend when remaining ≤ ${formatSecs(thresholdSec)}`
                    }
                    return `Extend service time`
                  })()}
                  disabled={serviceActionLoading[service] || !isRunning || !remainingSec || !canExtend}
                >
                  {serviceActionLoading[service] ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                  {Number(extendAvailability?.cooldown_remaining_seconds) > 0 && (
                    <span className="text-[10px] text-blue-300 font-semibold">{Math.ceil(extendAvailability.cooldown_remaining_seconds / 60)}m</span>
                  )}
                  {!canExtend && remainingSec && remainingSec > thresholdSec && (
                    <span className="text-[10px] text-blue-300 font-semibold">{formatSecs(Math.floor(remainingSec - thresholdSec))}</span>
                  )}
                </button>
              </div>

              {details && (
                <div className="flex flex-col gap-1.5 border-t border-[#35355e]/50 pt-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-gray-400">Status: {details.runtime?.status || 'stopped'}</span>
                    {isRunning && remainingSec !== null && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-gray-500 text-[11px]">Expires: {expiresAtMs ? new Date(expiresAtMs).toLocaleTimeString() : '(unknown)'}</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${remainingClass}`}>
                          {formatSecs(Math.floor(remainingSec))}
                        </span>
                      </div>
                    )}
                  </div>

                  {isRunning && (
                    isTcp && ncCommand ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/50 px-2 py-1 rounded text-green-300 flex-1 break-all select-all font-mono">
                          {ncCommand}
                        </code>
                        <button
                          className="p-1.5 bg-green-900/50 hover:bg-green-800 text-green-300 rounded text-xs px-2.5 font-semibold transition"
                          onClick={() => {
                            navigator.clipboard.writeText(ncCommand)
                            toast.success('Copied nc command')
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    ) : displayUrl ? (
                      <div className="flex items-center gap-2">
                        <a href={displayUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex-1 break-all bg-black/30 p-1.5 rounded transition">
                          {displayUrl}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-yellow-500">Waiting for endpoint allocation...</span>
                    )
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChallengeServicesPanel
