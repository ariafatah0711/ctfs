import { supabase } from './supabase'
import { Challenge, ChallengeWithSolve, LeaderboardEntry, Attachment } from '@/types'

/**
 * Ambil semua challenges
 */
export async function getChallenges(userId?: string): Promise<ChallengeWithSolve[]> {
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    if (!userId) {
      return challenges || []
    }

    // Ambil solves user untuk menandai challenge yang sudah diselesaikan
    const { data: solves } = await supabase
      .from('solves')
      .select('challenge_id')
      .eq('user_id', userId)

    const solvedChallengeIds = new Set(solves?.map(s => s.challenge_id) || [])

    return challenges?.map(challenge => ({
      ...challenge,
      is_solved: solvedChallengeIds.has(challenge.id)
    })) || []
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return []
  }
}

/**
 * Submit flag untuk challenge
 */
export async function submitFlag(challengeId: string, flag: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Ambil challenge untuk mendapatkan flag_hash
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('flag_hash, points')
      .eq('id', challengeId)
      .single()

    if (challengeError || !challenge) {
      return { success: false, message: 'Challenge tidak ditemukan' }
    }

    // Validasi flag dengan hash
    const { validateFlag, hashFlag } = await import('./crypto')

    // Debug info
    console.log('Flag submitted:', flag)
    console.log('Expected hash:', challenge.flag_hash)
    console.log('Actual hash:', hashFlag(flag))

    if (!validateFlag(flag, challenge.flag_hash)) {
      return { success: false, message: 'Flag salah! Cek hint untuk petunjuk.' }
    }

    // Cek apakah user sudah menyelesaikan challenge ini
    const { data: existingSolve } = await supabase
      .from('solves')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    if (existingSolve) {
      return { success: false, message: 'Challenge ini sudah diselesaikan!' }
    }

    // Insert solve
    const { error: solveError } = await supabase
      .from('solves')
      .insert({
        user_id: userId,
        challenge_id: challengeId
      })

    if (solveError) {
      return { success: false, message: 'Gagal menyimpan solve' }
    }

    return {
      success: true,
      message: `Flag benar! Kamu mendapat ${challenge.points} poin!`
    }
  } catch (error) {
    console.error('Error submitting flag:', error)
    return { success: false, message: 'Terjadi kesalahan saat submit flag' }
  }
}

/**
 * Tambah challenge baru (Admin only)
 */
export async function addChallenge(challengeData: {
  title: string
  description: string
  category: string
  points: number
  flag: string
  hint?: string
  attachments?: Attachment[]
  difficulty: string
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('challenges')
      .insert([{
        title: challengeData.title,
        description: challengeData.description,
        category: challengeData.category,
        points: challengeData.points,
        flag: challengeData.flag,
        // flag_hash akan auto-generate dari database trigger
        hint: challengeData.hint || null,
        attachments: challengeData.attachments || [],
        difficulty: challengeData.difficulty,
        is_active: true
      }])

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Error adding challenge:', error)
    throw error
  }
}

/**
 * Update challenge (Admin only)
 */
export async function updateChallenge(challengeId: string, challengeData: {
  title: string
  description: string
  category: string
  points: number
  flag?: string
  hint?: string
  attachments?: Attachment[]
  difficulty: string
  is_active?: boolean
}): Promise<void> {
  try {
    const updateData: any = {
      title: challengeData.title,
      description: challengeData.description,
      category: challengeData.category,
      points: challengeData.points,
      hint: challengeData.hint || null,
      attachments: challengeData.attachments || [],
      difficulty: challengeData.difficulty,
      is_active: challengeData.is_active !== undefined ? challengeData.is_active : true,
      updated_at: new Date().toISOString()
    }

    // Only update flag if provided (flag_hash akan auto-generate dari trigger)
    if (challengeData.flag) {
      updateData.flag = challengeData.flag
      // flag_hash akan auto-generate dari database trigger
    }

    const { error } = await supabase
      .from('challenges')
      .update(updateData)
      .eq('id', challengeId)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Error updating challenge:', error)
    throw error
  }
}

/**
 * Delete challenge (Admin only)
 */
export async function deleteChallenge(challengeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Error deleting challenge:', error)
    throw error
  }
}

/**
 * Get challenge by ID (Admin only - includes flag info)
 */
export async function getChallengeById(challengeId: string): Promise<Challenge | null> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return null
  }
}

/**
 * Ambil leaderboard dengan progress
 */
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('solves')
    .select(`
      created_at,
      challenges(points),
      users(id, username)
    `)
    .order('created_at', { ascending: true })

  if (error) throw error

  // transform ke leaderboard progress
  const userProgress: Record<string, { username: string, progress: { date: string, score: number }[] }> = {}

  data.forEach((row: any) => {
    const uid = (row.users as { id: string, username: string }).id
    if (!userProgress[uid]) {
      userProgress[uid] = {
        username: (row.users as { id: string, username: string }).username,
        progress: []
      }
    }
    const prevScore = userProgress[uid].progress.at(-1)?.score || 0
    userProgress[uid].progress.push({
      date: row.created_at,
      score: prevScore + row.challenges.points
    })
  })

  const startDate = data[0]?.created_at || new Date().toISOString()

  return Object.values(userProgress).map(user => ({
    username: user.username,
    progress: [
      { date: startDate, score: 0 }, // mulai dari 0
      ...user.progress
    ]
  }))
}
