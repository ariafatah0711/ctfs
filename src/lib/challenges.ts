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
export async function getChallenges(
  userId?: string,
  showAll: boolean = false
): Promise<ChallengeWithSolve[]> {
  try {
    let query = supabase
      .from('challenges')
      .select('*')
      .order('points', { ascending: true });

    if (!showAll) {
      query = query.eq('is_active', true); // cuma ambil yang aktif kalau showAll=false
    }

    const { data: challenges, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!userId) {
      return challenges || [];
    }

    // Ambil solves user untuk menandai challenge yang sudah diselesaikan
    const { data: solves } = await supabase
      .from('solves')
      .select('challenge_id')
      .eq('user_id', userId);

    const solvedChallengeIds = new Set(solves?.map(s => s.challenge_id) || []);

    return challenges?.map(challenge => ({
      ...challenge,
      is_solved: solvedChallengeIds.has(challenge.id),
    })) || [];
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
}

/**
 * Submit flag untuk challenge
 */
export async function submitFlag(challengeId: string, flag: string) {
  const { data, error } = await supabase.rpc('submit_flag', {
    // p_user_id: userId,
    p_challenge_id: challengeId,
    p_flag: flag,
  });

  if (error) {
    console.error('RPC error:', error);
    return { success: false, message: 'Gagal submit flag' };
  }

  return data;
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
  hint?: string | string[] | null
  attachments?: Attachment[]
  difficulty: string
}): Promise<void> {
  try {
    let hintValue: any = null;
    if (Array.isArray(challengeData.hint)) {
      hintValue = challengeData.hint.length > 0 ? JSON.stringify(challengeData.hint) : null;
    } else if (typeof challengeData.hint === 'string' && challengeData.hint.trim() !== '') {
      hintValue = JSON.stringify([challengeData.hint]);
    }
    const { error } = await supabase.rpc('add_challenge', {
      p_title: challengeData.title,
      p_description: challengeData.description,
      p_category: challengeData.category,
      p_points: challengeData.points,
      p_flag: challengeData.flag,
      p_difficulty: challengeData.difficulty,
      p_hint: hintValue,
      p_attachments: challengeData.attachments || []
    });
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
  hint?: string | string[] | null
  attachments?: Attachment[]
  difficulty: string
  is_active?: boolean
}): Promise<void> {
  try {
    let hintValue: any = null;
    if (Array.isArray(challengeData.hint)) {
      hintValue = challengeData.hint.length > 0 ? JSON.stringify(challengeData.hint) : null;
    } else if (typeof challengeData.hint === 'string' && challengeData.hint.trim() !== '') {
      hintValue = JSON.stringify([challengeData.hint]);
    }
    const { error } = await supabase.rpc('update_challenge', {
      p_challenge_id: challengeId,
      p_title: challengeData.title,
      p_description: challengeData.description,
      p_category: challengeData.category,
      p_points: challengeData.points,
      p_difficulty: challengeData.difficulty,
      p_hint: hintValue,
      p_attachments: challengeData.attachments || [],
      p_is_active: challengeData.is_active !== undefined ? challengeData.is_active : true,
      p_flag: challengeData.flag || null
    });
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
    const { error } = await supabase.rpc('delete_challenge', {
      p_challenge_id: challengeId
    });
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
 * Ambil Register solver untuk sebuah challenge
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

/**
 * Ambil flag challenge (Admin only)
 */
export async function getFlag(challengeId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_flag', {
      p_challenge_id: challengeId
    });

    if (error) {
      console.error('Error fetching flag:', error);
      return null;
    }

    return data; // data sudah berupa text (flag)
  } catch (err) {
    console.error('Unexpected error fetching flag:', err);
    return null;
  }
}


/**
 * Set active / inactive challenge (Admin only)
 */
export async function setChallengeActive(challengeId: string, isActive: boolean): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('set_challenge_active', {
      p_challenge_id: challengeId,
      p_active: isActive,
    });

    if (error) {
      console.error('Error setting challenge active state:', error);
      return false;
    }

    return data?.success === true;
  } catch (err) {
    console.error('Unexpected error setting challenge active state:', err);
    return false;
  }
}

/**
 * Ambil semua solver (Admin only) dengan pagination
*/
export async function getSolversAll(limit = 250, offset = 0) {
  const { data, error } = await supabase.rpc('get_solvers_all', {
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching solvers (paginated):', error);
    return [];
  }

  return data || [];
}

export async function deleteSolver(solveId: string) {
  const { data, error } = await supabase.rpc("delete_solver", {
    p_solve_id: solveId,
  })

  if (error) throw error
  return data
}

/**
 * Ambil notifikasi (chall baru & first blood)
 */
export async function getNotifications(limit = 100, offset = 0) {
  const { data, error } = await supabase.rpc('get_notifications', {
    p_limit: limit,
    p_offset: offset,
  });
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  console.log(data)
  return data || [];
}
