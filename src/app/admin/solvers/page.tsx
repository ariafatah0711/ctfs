"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/auth"
import { getSolversAll, getSolversByUsername, deleteSolver } from "@/lib/challenges"
import ConfirmDialog from "@/components/custom/ConfirmDialog"
import Loader from "@/components/custom/loading"
import BackButton from "@/components/custom/BackButton"

import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { formatRelativeDate } from '@/lib/utils'

export default function AdminSolversPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)

  const [solvers, setSolvers] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchUser, setSearchUser] = useState("")
  const [searching, setSearching] = useState(false)

  // delete state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [pendingDeleteDetail, setPendingDeleteDetail] = useState<{username: string, challenge_title: string} | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      if (!user) {
        router.push("/challenges")
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      setIsAdminUser(adminCheck)
      if (!adminCheck) {
        router.push("/challenges")
        return
      }

      fetchSolvers(0)
    })()

    return () => {
      mounted = false
    }
  }, [user, loading, router])

  const fetchSolvers = async (startOffset = 0) => {
    try {
      const data = await getSolversAll(100, startOffset)
      setSolvers((prev) => (startOffset === 0 ? data : [...prev, ...data]))
      setOffset(startOffset + 100)
      setHasMore(data.length === 100)
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch solvers")
    }
  }

  const askDelete = (id: string) => {
    const solver = solvers.find((s) => s.solve_id === id)
    setPendingDelete(id)
    if (solver) {
      setPendingDeleteDetail({ username: solver.username, challenge_title: solver.challenge_title })
    } else {
      setPendingDeleteDetail(null)
    }
    setConfirmOpen(true)
  }

  const doDelete = async (id: string) => {
    try {
      await deleteSolver(id) // implementasikan di lib/challenges
      setSolvers((prev) => prev.filter((s) => s.solve_id !== id))
      toast.success("Solver deleted successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete solver")
    }
  }

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user || !isAdminUser) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/admin" label="Go Back" />
        </div>

        <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>All Solvers</CardTitle>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-3 py-1 text-sm rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!searchUser.trim()) {
                  fetchSolvers(0)
                  return
                }
                setSearching(true)
                try {
                  const data = await getSolversByUsername(searchUser.trim())
                  setSolvers(data)
                  setHasMore(false)
                } catch (err) {
                  toast.error("Failed to fetch by username")
                  console.error(err)
                } finally {
                  setSearching(false)
                }
              }}
            >
              {searching ? "Searching..." : "Search"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchUser("")
                fetchSolvers(0)
              }}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
          <CardContent>
            {solvers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-300">No solvers found</div>
            ) : (
              <motion.div
                className="divide-y border dark:border-gray-700 rounded-md overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {solvers.map((s, idx) => (
                  <motion.div
                    key={s.solve_id}
                    className="flex items-center justify-between px-4 py-3 transition-colors border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.03 }}
                  >
                    <div className="truncate">
                      <Link
                        href={`/user/${s.username}`}
                        className="font-medium text-blue-600 dark:text-blue-300 hover:underline"
                        title={s.username}
                      >
                        {s.username.length > 20 ? `${s.username.slice(0, 30)}...` : s.username}
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-gray-300"> solved </span>
                      <span className="text-xs text-gray-700 dark:text-gray-200 font-semibold">{s.challenge_title}</span>
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-300">
                        {formatRelativeDate(s.solved_at)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => askDelete(s.solve_id)}
                      aria-label="Delete Solver"
                      title="Delete Solver"
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => fetchSolvers(offset)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Solver"
        description={
          <div>
            <div className="mb-2">Are you sure you want to delete this solver record? This action cannot be undone.</div>
            {pendingDeleteDetail && (
              <div className="mt-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold flex flex-col gap-1">
                <span>👤 <b>User:</b> <span className="font-mono">{pendingDeleteDetail.username}</span></span>
                <span>🏆 <b>Challenge:</b> <span className="font-mono">{pendingDeleteDetail.challenge_title}</span></span>
              </div>
            )}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (pendingDelete) {
            await doDelete(pendingDelete)
            setPendingDelete(null)
            setPendingDeleteDetail(null)
            setConfirmOpen(false)
          }
        }}
      />
    </div>
  )
}
