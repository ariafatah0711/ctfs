// Ambil rank user saja (berdasarkan username)
export async function getUserRank(username: string): Promise<number | null> {
  const leaderboard = await getLeaderboard();
  leaderboard.sort((a, b) => {
    const scoreA = a.progress.length > 0 ? a.progress[a.progress.length - 1].score : 0;
    const scoreB = b.progress.length > 0 ? b.progress[b.progress.length - 1].score : 0;
    return scoreB - scoreA;
  });
  const idx = leaderboard.findIndex(entry => entry.username === username);
  return idx !== -1 ? idx + 1 : null;
}
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
export async function submitFlag(
  challengeId: string,
  flag: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Ambil challenge untuk mendapatkan flag_hash
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('flag_hash, points')
      .eq('id', challengeId)
      .single()

    if (challengeError || !challenge) {
      return { success: false, message: 'Challenge tidak ditemukan.' }
    }

    // Validasi flag dengan hash
    const { validateFlag } = await import('./crypto')
    const isCorrect = validateFlag(flag, challenge.flag_hash)

    // Cek apakah sudah solve
    const { data: existingSolve } = await supabase
      .from('solves')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle()

    if (isCorrect) {
      if (existingSolve) {
        return { success: true, message: 'Benar, tapi kamu sudah pernah menyelesaikan challenge ini.' }
      }
      // Insert solve
      const { error: solveError } = await supabase
        .from('solves')
        .insert({
          user_id: userId,
          challenge_id: challengeId
        })

      if (solveError) {
        return { success: false, message: 'Gagal menyimpan penyelesaian challenge.' }
      }

      return {
        success: true,
        message: `Flag benar! Kamu mendapatkan ${challenge.points} poin.`
      }
    } else {
      if (existingSolve) {
        return { success: false, message: 'Flag salah, tapi kamu sudah pernah menyelesaikan challenge ini.' }
      }
      return { success: false, message: 'Flag salah. Silakan coba lagi.' }
    }
  } catch (error) {
    console.error('Error submitting flag:', error)
    return { success: false, message: 'Terjadi kesalahan saat submit flag.' }
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

/**
 * Ambil daftar solver untuk sebuah challenge
 */
export async function getSolversByChallenge(challengeId: string) {
  try {
    const { data, error } = await supabase
      .from('solves')
      .select('created_at, users(username)')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Pakai any agar TypeScript tidak protes
    return ((data as any[]) || []).map(row => ({
      username: row.users.username,
      solvedAt: row.created_at
    }))
  } catch (error) {
    console.error('Error fetching solvers:', error)
    return []
  }
}

/**
 * Get first blood challenge IDs for a user
 */
export async function getFirstBloodChallengeIds(userId: string): Promise<string[]> {
  try {
    // Ambil semua challenge yang pernah di-solve user
    const { data: solves, error } = await supabase
      .from('solves')
      .select('challenge_id, created_at')
      .eq('user_id', userId)

    if (error) throw error
    if (!solves || solves.length === 0) return []

    const challengeIds = solves.map(s => s.challenge_id)

    // Ambil solve pertama untuk setiap challenge yang sudah di-solve user
    const { data: firstSolves, error: firstError } = await supabase
      .from('solves')
      .select('challenge_id, user_id, created_at')
      .in('challenge_id', challengeIds)
      .order('created_at', { ascending: true })

    if (firstError) throw firstError

    // Map: challenge_id => user_id first solver
    const firstBloodIds: string[] = []
    for (const cid of challengeIds) {
      const first = firstSolves.find(s => s.challenge_id === cid)
      if (first && first.user_id === userId) {
        firstBloodIds.push(cid)
      }
    }
    return firstBloodIds
  } catch (err) {
    console.error('Error fetching first bloods:', err)
    return []
  }
}
