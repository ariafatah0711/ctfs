"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/auth"
import { getSolversAll, deleteSolver } from "@/lib/challenges"
import ConfirmDialog from "@/components/custom/ConfirmDialog"
import Loader from "@/components/custom/loading"
import BackButton from "@/components/custom/BackButton"

import toast from "react-hot-toast"

export default function AdminSolversPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)

  const [solvers, setSolvers] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // delete state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      if (!user) {
        router.push("/challanges")
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      setIsAdminUser(adminCheck)
      if (!adminCheck) {
        router.push("/challanges")
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
      const data = await getSolversAll(50, startOffset)
      setSolvers((prev) => (startOffset === 0 ? data : [...prev, ...data]))
      setOffset(startOffset + 50)
      setHasMore(data.length === 50)
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch solvers")
    }
  }

  const askDelete = (id: string) => {
    setPendingDelete(id)
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

  if (loading) return <Loader fullscreen color="text-blue-500" />
  if (!user || !isAdminUser) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/admin" label="Go Back" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Solvers</CardTitle>
            <Button variant="outline" size="sm" onClick={() => fetchSolvers(0)}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {solvers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No solvers found</div>
            ) : (
              <div className="divide-y border rounded-md overflow-hidden">
                {solvers.map((s) => (
                  <div
                    key={s.solve_id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="truncate">
                      <Link
                        href={`/user/${s.username}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {s.username}
                      </Link>
                      <span className="text-xs text-gray-500"> solved </span>
                      <span className="text-xs">{s.challenge_title}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(s.solved_at).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => askDelete(s.solve_id)}
                    >
                      🗑️
                    </Button>
                  </div>
                ))}
              </div>
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
        description="Are you sure you want to delete this solver record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (pendingDelete) {
            await doDelete(pendingDelete)
            setPendingDelete(null)
            setConfirmOpen(false)
          }
        }}
      />
    </div>
  )
}
