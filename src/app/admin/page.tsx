'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getChallenges, addChallenge, updateChallenge, deleteChallenge, getChallengeById } from '@/lib/challenges'
import { hashFlag } from '@/lib/crypto'
import { Challenge, User, Attachment } from '@/types'
import Navbar from '@/components/Navbar'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [adminStatus, setAdminStatus] = useState<boolean>(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web',
    points: 100,
    flag: '',
    hint: [] as string[],
    difficulty: 'Easy',
    attachments: [] as Attachment[]
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Check admin status
      const adminCheck = await isAdmin()
      setAdminStatus(adminCheck)

      if (!adminCheck) {
        router.push('/challanges')
        return
      }

      const challengesData = await getChallenges()
      setChallenges(challengesData)
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const challengeData: any = {
        title: (formData.title || "").trim(),
        description: (formData.description || "").trim(),
        category: (formData.category || "").trim(),
        points: Number(formData.points) || 0,
        hint: (formData.hint && formData.hint.length > 0)
          ? formData.hint.filter(h => h.trim() !== '')
          : null,
        difficulty: (formData.difficulty || "").trim(),
        attachments: formData.attachments || []
      }

      // Only update flag if provided (flag_hash akan auto-generate dari database trigger)
      if ((formData.flag || "").trim()) {
        challengeData.flag = (formData.flag || "").trim()
        // flag_hash tidak perlu di-set manual, akan auto-generate dari trigger
      }

      if (editingChallenge) {
        // Update existing challenge
        await updateChallenge(editingChallenge.id, challengeData)
  alert('Challenge updated!')
        setEditingChallenge(null)
      } else {
        // Add new challenge - flag is required for new challenges
        if (!formData.flag.trim()) {
    alert('Flag is required for new challenges!')
          setSubmitting(false)
          return
        }
        challengeData.flag = formData.flag
        // flag_hash akan auto-generate dari database trigger
        await addChallenge(challengeData)
  alert('Challenge added!')
      }

      // Refresh challenges list
      const challengesData = await getChallenges()
      setChallenges(challengesData)

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Web',
        points: 100,
        flag: '',
        hint: [],
        difficulty: 'Easy',
        attachments: []
      })
      setShowAddForm(false)

    } catch (error) {
      console.error('Error saving challenge:', error)
  alert('Failed to save challenge')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    let parsedHint: string[] = [];
    if (Array.isArray(challenge.hint)) {
      parsedHint = challenge.hint.filter(h => typeof h === 'string');
    } else if (typeof challenge.hint === 'string' && challenge.hint.trim() !== '') {
      try {
        const arr = JSON.parse(challenge.hint);
        if (Array.isArray(arr)) {
          parsedHint = arr.filter(h => typeof h === 'string');
        } else {
          parsedHint = [challenge.hint];
        }
      } catch {
        parsedHint = [challenge.hint];
      }
    } else {
      parsedHint = [];
    }
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      points: challenge.points,
      flag: challenge.flag, // Show current flag for editing
      hint: parsedHint,
      difficulty: challenge.difficulty,
      attachments: challenge.attachments || []
    })
    setShowAddForm(true)
  }

  const handleDelete = async (challengeId: string) => {
  if (!confirm('Are you sure you want to delete this challenge?')) return

    try {
      await deleteChallenge(challengeId)

      // Refresh challenges list
      const challengesData = await getChallenges()
      setChallenges(challengesData)

  alert('Challenge deleted!')
    } catch (error) {
      console.error('Error deleting challenge:', error)
  alert('Failed to delete challenge')
    }
  }


  const handleCancelEdit = () => {
    setEditingChallenge(null)
    setShowAddForm(false)
    setFormData({
      title: '',
      description: '',
      category: 'Web',
      points: 100,
      flag: '',
      hint: [],
      difficulty: 'Easy',
      attachments: []
    })
  }

  // Hint array handlers
  function addHint() {
    setFormData(prev => ({
      ...prev,
      hint: [...(prev.hint || []), '']
    }))
  }
  function removeHint(index: number) {
    setFormData(prev => ({
      ...prev,
      hint: prev.hint.filter((_, i) => i !== index)
    }))
  }
  function updateHint(index: number, value: string) {
    setFormData(prev => ({
      ...prev,
      hint: prev.hint.map((h, i) => i === index ? value : h)
    }))
  }

  const addAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, { name: '', url: '', type: 'file' }]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const updateAttachment = (index: number, field: keyof Attachment, value: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map((attachment, i) =>
        i === index ? { ...attachment, [field]: value } : attachment
      )
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Challenges</h1>
            <p className="mt-2 text-gray-600">Manage CTF challenges</p>
          </div>

          {/* Add Challenge Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
            >
              {showAddForm ? 'Cancel' : 'Add Challenge'}
            </button>
          </div>

          {/* Add Challenge Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., SQL Injection Basics"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Web">Web</option>
                    <option value="Reverse">Reverse Engineering</option>
                    <option value="Crypto">Cryptography</option>
                    <option value="Forensics">Forensics</option>
                    <option value="Pwn">Pwn</option>
                    <option value="Misc">Miscellaneous</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>

                  {showPreview ? (
                    <div className="border border-gray-300 rounded-md p-3 bg-gray-50 min-h-[100px]">
                      <div className="text-sm text-gray-600">
                        <MarkdownRenderer content={formData.description || '*No description provided*'} />
                      </div>
                    </div>
                  ) : (
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Challenge description... (supports markdown: **bold**, *italic*, `code`, [links](url), etc.)"
                    />
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Supports markdown: **bold**, *italic*, `code`, [links](url), ```code blocks```, lists, etc.
                  </p>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag
                  </label>
                  <input
                    type="text"
                    required={!editingChallenge}
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={editingChallenge ? "Leave blank to keep current flag" : "ctf{flag_here}"}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingChallenge
                      ? 'Leave blank to keep current flag. Flag will be hashed automatically.'
                      : 'Flag will be stored as plain text and hashed for validation.'
                    }
                  </p>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hint (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addHint}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      + Add Hint
                    </button>
                  </div>
                  {formData.hint.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No hints added. Click Add Hint to add hints.</p>
                  )}
                  {formData.hint.map((hint, idx) => (
                    <div key={idx} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={hint}
                        onChange={e => updateHint(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder={`Hint #${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeHint(idx)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >✕</button>
                    </div>
                  ))}
                </div>

                {/* Attachments */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Attachments (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addAttachment}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      + Add File
                    </button>
                  </div>

                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2 p-3 border border-gray-200 rounded-md">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={attachment.name}
                          onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                          placeholder="File name (e.g., app.py)"
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="url"
                          value={attachment.url}
                          onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                          placeholder="Download URL"
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <select
                          value={attachment.type}
                          onChange={(e) => updateAttachment(index, 'type', e.target.value as 'file' | 'link')}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="file">File</option>
                          <option value="link">Link</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {formData.attachments.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No attachments added. Click Add File to add download links or files.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    {submitting
                      ? (editingChallenge ? 'Updating...' : 'Adding...')
                      : (editingChallenge ? 'Update' : 'Add')
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Challenges List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Challenge List</h2>
            {challenges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No challenges yet</div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg">
                <ul>
                  {challenges.map((challenge) => (
                    <li key={challenge.id} className="flex items-center px-3 py-2 border-b last:border-b-0">
                      <span className={`w-2 h-2 rounded-full mr-3 ${
                        challenge.difficulty === 'Easy' ? 'bg-green-400' :
                        challenge.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <span className="flex-1 truncate text-sm font-medium text-gray-800">{challenge.title}</span>
                      <span className="ml-2 text-xs text-gray-500">{challenge.category}</span>
                      <span className={`ml-2 text-xs ${
                        challenge.is_active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {challenge.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">{challenge.points} pts</span>
                      <span className="ml-2 text-xs text-gray-400">{challenge.difficulty}</span>
                      <button
                        onClick={() => handleEdit(challenge)}
                        className="ml-3 text-gray-500 hover:text-yellow-600"
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="ml-1 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >🗑️</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
