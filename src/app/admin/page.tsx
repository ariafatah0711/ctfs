"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from "@/components/ui/switch"
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import ChallengeFilterBar from '@/components/challanges/ChallengeFilterBar'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Loader from "@/components/custom/loading"
import ConfirmDialog from '@/components/custom/ConfirmDialog'

import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/auth'
import { getChallenges, addChallenge, updateChallenge, setChallengeActive, deleteChallenge, getFlag, getSolversAll } from '@/lib/challenges'
import { Challenge, Attachment } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [solvers, setSolvers] = useState<any[]>([])
  const [solverOffset, setSolverOffset] = useState(0)
  const [hasMoreSolvers, setHasMoreSolvers] = useState(true)

  // Dialog / form state
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<Challenge | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const askDelete = (id: string) => {
    setPendingDelete(id)
    setConfirmOpen(true)
  }

  const emptyForm = {
    title: '',
    description: '',
    category: 'Web',
    points: 100,
    flag: '',
    hint: [] as string[],
    difficulty: 'Easy',
    attachments: [] as Attachment[],
  }

  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    search: "",
  })

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      difficulty: "all",
      search: "",
    })
  }

  const [formData, setFormData] = useState(() => ({ ...emptyForm }))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (loading) return

      // if not logged in, redirect to challenges listing
      if (!user) {
        router.push('/challanges')
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      setIsAdminUser(adminCheck)
      if (!adminCheck) {
        router.push('/challanges')
        return
      }

      const data = await getChallenges(undefined, true)
      fetchSolvers(0)
      if (!mounted) return
      setChallenges(data)
    })()

    return () => { mounted = false }
  }, [user, loading, router])

  const openAdd = () => {
    setEditing(null)
    setFormData({ ...emptyForm })
    setOpenForm(true)
    setShowPreview(false)
  }

  const openEdit = (c: Challenge) => {
    // normalize hint to array
    let parsedHint: string[] = []
    if (Array.isArray(c.hint)) parsedHint = c.hint.filter(h => typeof h === 'string')
    else if (typeof c.hint === 'string' && c.hint.trim() !== '') {
      try {
        const arr = JSON.parse(c.hint as unknown as string)
        if (Array.isArray(arr)) parsedHint = arr.filter(h => typeof h === 'string')
        else parsedHint = [c.hint as unknown as string]
      } catch {
        parsedHint = [c.hint as unknown as string]
      }
    }

    setEditing(c)
    setFormData({
      title: c.title,
      description: c.description || '',
      category: c.category || 'Web',
      points: c.points || 100,
      flag: c.flag || '',
      hint: parsedHint,
      difficulty: c.difficulty || 'Easy',
      attachments: c.attachments || [],
    })
    setOpenForm(true)
    setShowPreview(false)
  }

  const refresh = async () => {
    const data = await getChallenges(undefined, true)
    setChallenges(data)
  }

  const fetchSolvers = async (offset = 0) => {
    const data = await getSolversAll(50, offset)
    setSolvers(prev => offset === 0 ? data : [...prev, ...data])
    setSolverOffset(offset + 50)
    setHasMoreSolvers(data.length === 50)
  }

  const handleViewFlag = async (id: string) => {
    const flag = await getFlag(id)
    if (flag) {
      toast.success(`Flag: ${flag}`)
    } else {
      toast.error('Failed to take flag or you are not admin.')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {
        title: (formData.title || '').trim(),
        description: (formData.description || '').trim(),
        category: (formData.category || '').trim(),
        points: Number(formData.points) || 0,
        hint: (formData.hint && formData.hint.length > 0) ? formData.hint.filter(h => h.trim() !== '') : null,
        difficulty: (formData.difficulty || '').trim(),
        attachments: (formData.attachments || []).filter((a) => (a.url || '').trim() !== ''),
      }

      if ((formData.flag || '').trim()) payload.flag = formData.flag.trim()

      if (editing) {
        await updateChallenge(editing.id, payload)
      } else {
        if (!formData.flag.trim()) {
          toast.error('Flag is required for new challenges')
          setSubmitting(false)
          return
        }
        payload.flag = formData.flag.trim()
        await addChallenge(payload)
      }

      await refresh()
      setOpenForm(false)
      setEditing(null)
      setFormData({ ...emptyForm })
      toast.success('Challenge saved successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save challenge')
    } finally {
      setSubmitting(false)
    }
  }

  const doDelete = async (id: string) => {
    try {
      await deleteChallenge(id)
      await refresh()
      toast.success('Challenge deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete challenge')
    }
  }

  const filteredChallenges = challenges.filter((c) => {
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category !== "all" && c.category !== filters.category) return false
    if (filters.difficulty !== "all" && c.difficulty !== filters.difficulty) return false
    return true
  })

  // hint handlers
  const addHint = () => setFormData(prev => ({ ...prev, hint: [...(prev.hint || []), ''] }))
  const updateHint = (i: number, v: string) => setFormData(prev => ({ ...prev, hint: prev.hint.map((h, idx) => idx === i ? v : h) }))
  const removeHint = (i: number) => setFormData(prev => ({ ...prev, hint: prev.hint.filter((_, idx) => idx !== i) }))

  // attachments
  const addAttachment = () => setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { name: '', url: '', type: 'file' }] }))
  const updateAttachment = (i: number, field: keyof Attachment, v: string) => setFormData(prev => ({ ...prev, attachments: prev.attachments.map((a, idx) => idx === i ? { ...a, [field]: v } : a) }))
  const removeAttachment = (i: number) => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))

  if (loading) return <Loader fullscreen color="text-orange-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Kiri: Challenge List */}
          <div className="lg:col-span-3 order-1">
            <Card className="h-full mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Challenge List</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={openAdd}>+ Add Challenge</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <ChallengeFilterBar
                filters={filters}
                categories={Array.from(new Set(challenges.map(c => c.category)))}
                difficulties={Array.from(new Set(challenges.map(c => c.difficulty)))}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                showStatusFilter={false}
              />
              <CardContent>
                {filteredChallenges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No challenges found</div>
                ) : (
                  <div className="divide-y border rounded-md overflow-hidden">
                    {filteredChallenges.map(ch => (
                     <motion.div
                        key={ch.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Badge className={ch.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : ch.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {ch.difficulty}
                          </Badge>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{ch.title}</div>
                              <div className="text-xs text-muted-foreground truncate">{ch.category} • {ch.points} pts</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                          <Switch checked={ch.is_active} onCheckedChange={async (checked) => {
                            const ok = await setChallengeActive(ch.id, checked)
                            if (ok) {
                              setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, is_active: checked } : c))
                              toast.success(`Challenge ${checked ? 'activated' : 'deactivated'}`)
                            }
                          }} />

                          <Button variant="ghost" size="sm" onClick={() => openEdit(ch)}>✏️</Button>
                          <Button variant="ghost" size="sm" onClick={() => askDelete(ch.id)}>🗑️</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleViewFlag(ch.id)}>
                            <span className="hidden sm:inline">🏳️ View Flag</span>
                            <span className="sm:hidden">🏳️ Flag</span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kanan: Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-none flex flex-col gap-6 h-auto lg:h-[calc(100vh-6rem)] overflow-y-auto sticky top-24 scroll-hidden">
            {/* Overview */}
            <Card className="shrink-0">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border bg-white shadow-sm">
                    <div className="text-sm text-muted-foreground">Challenges</div>
                    <div className="text-2xl font-semibold">{challenges.length}</div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-3 rounded-lg border bg-white shadow-sm">
                    <div className="text-sm text-muted-foreground">Active</div>
                    <div className="text-2xl font-semibold">{challenges.filter(c => c.is_active).length}</div>
                  </motion.div>
                </div>

                <div className="mb-6">
                  <div className="text-sm font-semibold mb-2 text-gray-700">By Category</div>
                  <div className="space-y-2">
                    {Array.from(new Set(challenges.map(c => c.category))).map(cat => {
                      const count = challenges.filter(c => c.category === cat).length
                      return (
                        <div key={cat} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium">{cat}</span>
                          <Badge className="bg-blue-100 text-blue-800">{count}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2 text-gray-700">By Difficulty</div>
                  <div className="space-y-2">
                    {["Easy", "Medium", "Hard"].map(diff => {
                      const count = challenges.filter(c => c.difficulty === diff).length
                      return (
                        <div key={diff} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                          <span className="text-sm font-medium">{diff}</span>
                          <Badge className={diff === "Easy" ? "bg-green-100 text-green-800" : diff === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>{count}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Solvers */}
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Solvers</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/solvers')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {solvers.length === 0 ? (
                  <div className="text-gray-500 text-sm">No solvers yet</div>
                ) : (
                  <div className="space-y-2">
                    {solvers.slice(0, 10).map(s => (
                      <div
                        key={s.solve_id}
                        className="flex items-center justify-between border-b pb-1"
                      >
                        <div>
                          <Link
                            href={`/user/${s.username}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {s.username}
                          </Link>
                          <span className="text-xs text-gray-500"> solved </span>
                          <span className="text-xs">{s.challenge_title}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(s.solved_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {openForm && (
          <Dialog open={openForm} onOpenChange={(v) => { if (!v) { setOpenForm(false); setEditing(null) } else setOpenForm(true) }}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Challenge' : 'Add New Challenge'}</DialogTitle>
              </DialogHeader>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e) }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Title</Label>
                    <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="Reverse">Reverse</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Forensics">Forensics</SelectItem>
                        <SelectItem value="Pwn">Pwn</SelectItem>
                        <SelectItem value="Misc">Misc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Points</Label>
                    <Input type="number" required value={String(formData.points)} onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })} />
                  </div>

                  <div>
                    <Label>Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Deskripsi</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(prev => !prev)}>{showPreview ? 'Edit' : 'Preview'}</Button>
                    </div>

                    {showPreview ? (
                      <div className="border rounded p-3 bg-gray-50">
                        <MarkdownRenderer content={formData.description || '*No description provided*'} />
                      </div>
                    ) : (
                      <Textarea required rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    )}
                  </div>

                  <div>
                    <Label>Flag</Label>
                    <Input required={!editing} value={formData.flag} onChange={(e) => setFormData({ ...formData, flag: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'ctf{...}'} />
                    <p className="text-xs text-muted-foreground mt-1">{editing ? 'Leave blank to keep current flag.' : 'Flag is required for new challenges.'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Hints</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={addHint}>+ Add</Button>
                    </div>
                    {formData.hint.length === 0 && <p className="text-xs text-muted-foreground">No hints added</p>}
                    <div className="space-y-2 mt-2">
                      {formData.hint.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input value={h} onChange={(e) => updateHint(idx, e.target.value)} />
                          <Button type="button" variant="ghost" onClick={() => removeHint(idx)}>✕</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Attachments</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={addAttachment}>+ Add</Button>
                    </div>

                    <div className="space-y-2 mt-2">
                      {formData.attachments.map((a, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <Input className="col-span-3" value={a.name} onChange={(e) => updateAttachment(idx, 'name', e.target.value)} placeholder="File name / Label" required />
                          <Input className="col-span-6" value={a.url} onChange={(e) => updateAttachment(idx, 'url', e.target.value)} placeholder="URL" required />

                          <Select value={a.type} onValueChange={(v) => updateAttachment(idx, 'type', v)}>
                            <SelectTrigger className="col-span-2"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="file">File</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button type="button" variant="ghost" onClick={() => removeAttachment(idx)} className="col-span-1">✕</Button>
                        </div>
                      ))}

                      {formData.attachments.length === 0 && (
                        <p className="text-xs text-muted-foreground">No attachments added</p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => { setOpenForm(false); setEditing(null) }}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Confirm dialog outside of mapping so it's global */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Challenge"
        description="Are you sure you want to delete this challenge? This action cannot be undone."
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
