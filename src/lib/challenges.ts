import { layouts } from 'chart.js';
import { supabase } from './supabase'
import { Challenge, ChallengeWithSolve, LeaderboardEntry, Attachment } from '@/types'

// Get user rank only (by username)
export async function getUserRank(username: string): Promise<number | null> {
  const leaderboard = await getLeaderboard();
  leaderboard.sort((a: any, b: any) => {
    const scoreA = a.progress.length > 0 ? a.progress[a.progress.length - 1].score : 0;
    const scoreB = b.progress.length > 0 ? b.progress[b.progress.length - 1].score : 0;
    return scoreB - scoreA;
  });
  const idx = leaderboard.findIndex((entry: any) => entry.username === username);
  return idx !== -1 ? idx + 1 : null;
}

/**
 * Get all challenges
 */
export async function getChallenges(
  userId?: string,
  showAll: boolean = false
): Promise<(ChallengeWithSolve & { has_first_blood: boolean; is_new: boolean })[]> {
  try {
    // 🔹 Ambil challenge list
    let query = supabase
      .from('challenges')
      .select('*')
      .order('points', { ascending: true })        // poin terendah dulu
      .order('total_solves', { ascending: false }) // jika poin sama, paling banyak solves dulu

    if (!showAll) query = query.eq('is_active', true);

    const { data: challenges, error } = await query;
    if (error) throw new Error(error.message);
    if (!challenges) return [];

    // 🔹 Ambil notif first blood dari RPC
    const notifications = (await getNotifications(500, 0)) as any[];

    // Cuma ambil yang notif_type = first_blood
    const fbIds = new Set(
      notifications
        .filter((n) => n.notif_type === 'first_blood')
        .map((n) => n.notif_challenge_id)
    );

    // 🔹 Cek solved user (optional)
    let solvedIds = new Set<string>();
    if (userId) {
      const { data: solves } = await supabase
        .from('solves')
        .select('challenge_id')
        .eq('user_id', userId);

      solvedIds = new Set(solves?.map((s) => s.challenge_id) || []);
    }

    return challenges.map(ch => {
      const createdAt = new Date(ch.created_at);
      const isRecentlyCreated = (Date.now() - createdAt.getTime()) < 24 * 60 * 60 * 1000;
      const hasFirstBlood = fbIds.has(ch.id);

      return {
        ...ch,
        is_solved: solvedIds.has(ch.id),
        has_first_blood: hasFirstBlood,
        is_recently_created: isRecentlyCreated,
        is_new: isRecentlyCreated || !hasFirstBlood,
        total_solves: ch.total_solves || 0,
      };
    });
  } catch (err) {
    console.error('Error fetching challenges:', err);
    return [];
  }
}

/**
 * Submit flag for a challenge
 */
export async function submitFlag(challengeId: string, flag: string) {
  const { data, error } = await supabase.rpc('submit_flag', {
    // p_user_id: userId,
    p_challenge_id: challengeId,
    p_flag: flag,
  });

  if (error) {
    console.error('RPC error:', error);
    return { success: false, message: 'Failed to submit flag' };
  }

  return data;
}

/**
 * Add a new challenge (Admin only)
 */
export async function addChallenge(challengeData: {
  title: string
  description: string
  category: string
  points: number
  max_points?: number
  flag: string
  hint?: string | string[] | null
  attachments?: Attachment[]
  difficulty: string
  is_dynamic?: boolean
  min_points?: number
  decay_per_solve?: number
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
      p_max_points: challengeData.max_points ?? null,
      p_flag: challengeData.flag,
      p_difficulty: challengeData.difficulty,
      p_hint: hintValue,
      p_attachments: challengeData.attachments || [],
      p_is_dynamic: challengeData.is_dynamic ?? false,
      p_min_points: challengeData.min_points ?? 0,
      p_decay_per_solve: challengeData.decay_per_solve ?? 0
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
  max_points?: number
  flag?: string
  hint?: string | string[] | null
  attachments?: Attachment[]
  difficulty: string
  is_active?: boolean
  is_dynamic?: boolean
  min_points?: number
  decay_per_solve?: number
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
      p_max_points: challengeData.max_points ?? null,
      p_difficulty: challengeData.difficulty,
      p_hint: hintValue,
      p_attachments: challengeData.attachments || [],
      p_is_active: challengeData.is_active, // kirim undefined jika tidak ada perubahan
      p_flag: challengeData.flag || null,
      p_is_dynamic: challengeData.is_dynamic ?? false,
      p_min_points: challengeData.min_points ?? 0,
      p_decay_per_solve: challengeData.decay_per_solve ?? 0
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
 * Get leaderboard with progress
 */
export async function getLeaderboard(limit = 100, offset = 0) {
  const { data, error } = await supabase.rpc('get_leaderboard', {
    limit_rows: limit,
    offset_rows: offset,
  })
  if (error) throw error
  return data
}

/**
 * Get lightweight leaderboard summary: username and final score (no progress history)
 */
export async function getLeaderboardSummary(limit = 100, offset = 0) {
  const data = await getLeaderboard(limit, offset)
  return (data || []).map((d: any) => ({
    id: d.id,
    username: d.username,
    score: typeof d.score === 'number' ? d.score : (d.progress?.at(-1)?.score ?? 0),
    rank: d.rank,
    last_solve: d.last_solve,
  }))
}

export async function getTopProgress(topUsers: string[]) {
  const { data, error } = await supabase
    .from('solves')
    .select(`
      created_at,
      challenges(points),
      users(id, username)
    `)
    .in('user_id', topUsers)
    .order('created_at', { ascending: true })
  // console.log('Get Solves User', topUsers, data, error)

  if (error) throw error

  // Build progress curve per user
  const rows: any[] = (data as any[]) || []
  const progress: Record<string, { username: string; history: { date: string; score: number }[] }> = {}
  for (const row of rows) {
    const user = row.users
    if (!user) continue
    if (!progress[user.id]) {
      progress[user.id] = { username: user.username, history: [] }
    }

    const prev = progress[user.id].history.at(-1)?.score || 0
    progress[user.id].history.push({
      date: row.created_at,
      score: prev + (row.challenges?.points || 0)
    })
  }

  return progress
}

/**
 * Fetch progress curves for a list of usernames (convenience wrapper).
 * Internally resolves usernames -> ids then reuses getTopProgress which expects user ids.
 */
export async function getTopProgressByUsernames(usernames: string[]) {
  if (!usernames || usernames.length === 0) return {}

  // Fetch user ids for the provided usernames
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username')
    .in('username', usernames)

  if (usersError) throw usersError

  const idToUsername: Record<string, string> = {}
  const ids: string[] = (users || []).map((u: any) => {
    idToUsername[u.id] = u.username
    return u.id
  })

  if (ids.length === 0) return {}

  const progressById = await getTopProgress(ids)

  // Transform to username-keyed map
  const result: Record<string, { username: string; history: { date: string; score: number }[] }> = {}
  for (const id of Object.keys(progressById)) {
    const entry = progressById[id]
    const uname = idToUsername[id]
    if (!uname) continue
    result[uname] = {
      username: entry.username,
      history: entry.history,
    }
  }

  return result
}

/**
 * Build a leaderboard based on first-bloods.
 * For each challenge that has a `first_blood` notification, find the earliest solve
 * and award that user the challenge's points. Aggregate per-user and return
 * a sorted leaderboard similar to `getLeaderboardSummary`.
 */
export async function getFirstBloodLeaderboard(limit = 100, offset = 0) {
  try {
    // Simpler approach: use notification payloads only (assumes notifications include username and points)
    const notifications = await getNotifications(2000, 0)
    if (!notifications || notifications.length === 0) return []

    // Filter only first_blood notifications
    const fbNotifs = notifications.filter((n: any) => n.notif_type === 'first_blood')
    if (fbNotifs.length === 0) return []

    // Aggregate directly from notifications. We do NOT use numeric "score" here;
    // instead build a cumulative first-blood timeline per user for the chart.
    const countMap: Record<string, number> = {}
    const perUserDates: Record<string, string[]> = {}

    for (const n of fbNotifs) {
      const username = n.notif_username || n.notif_user || null
      const created = n.notif_created_at || n.created_at || null
      if (!username) continue
      countMap[username] = (countMap[username] || 0) + 1
      perUserDates[username] = perUserDates[username] || []
      if (created) perUserDates[username].push(created)
    }

    const result = Object.keys(countMap)
      .map((username) => ({ username, firstBloodCount: countMap[username] || 0 }))
      // Sort primarily by firstBloodCount (desc)
      .sort((a, b) => (b.firstBloodCount || 0) - (a.firstBloodCount || 0))

    // Build cumulative progress timeline per user from their notification timestamps
    const progressMap: Record<string, { username: string; history: { date: string; score: number }[] }> = {}
    for (const username of Object.keys(perUserDates)) {
      const dates = perUserDates[username].slice().sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      let cum = 0
      progressMap[username] = { username, history: [] }
      for (const d of dates) {
        cum += 1
        progressMap[username].history.push({ date: d, score: cum })
      }
    }

    const leaderboard = result.slice(offset, offset + limit).map((r, i) => ({
      id: String(i + 1 + offset),
      username: r.username,
      rank: i + 1 + offset,
      score: r.firstBloodCount,
      // progress: cumulative first-blood count over time
      progress: progressMap[r.username]?.history || [],
    }))

    return leaderboard
  } catch (err) {
    console.error('Error building first-blood leaderboard:', err)
    return []
  }
}

// export async function getLeaderboard() {
//   const batchSize = 1000
//   let allSolves: any[] = []
//   let from = 0

//   console.log('Fetching solves with pagination...')

//   // 🔁 Fetch solves by batches until all retrieved
//   while (true) {
//     const { data, error } = await supabase
//       .from('solves')
//       .select(`
//         created_at,
//         challenges(points),
//         users(id, username)
//       `)
//       .order('created_at', { ascending: true })
//       .range(from, from + batchSize - 1)

//     if (error) throw error

//     allSolves = allSolves.concat(data)
//     console.log(`Fetched ${data.length} solves (total ${allSolves.length})`)

//     // stop if we’ve reached the last batch
//     if (data.length < batchSize) break
//     from += batchSize
//   }

//   console.log(`✅ Total solves fetched: ${allSolves.length}`)

//   // 🧩 Build progress per user
//   const userProgress: Record<string, { username: string, progress: { date: string, score: number }[] }> = {}
//   const startDate = allSolves[0]?.created_at || new Date().toISOString()

//   for (const row of allSolves) {
//     const user = row.users
//     if (!userProgress[user.id]) {
//       userProgress[user.id] = { username: user.username, progress: [{ date: startDate, score: 0 }] }
//     }

//     const prevScore = userProgress[user.id].progress.at(-1)?.score || 0
//     const points = row.challenges?.points || 0

//     userProgress[user.id].progress.push({
//       date: row.created_at,
//       score: prevScore + points,
//     })
//   }

//   // 🏁 Final leaderboard (sorted by score)
//   const leaderboard = Object.values(userProgress)
//     .map(user => ({
//       username: user.username,
//       score: user.progress.at(-1)?.score || 0,
//       progress: user.progress,
//     }))
//     .sort((a, b) => b.score - a.score)

//   console.log(`🏆 Leaderboard built with ${leaderboard.length} users`)
//   return leaderboard
// }

/**
 * Get registered solvers for a challenge
 */
export async function getSolversByChallenge(challengeId: string) {
  try {
    const { data, error } = await supabase
      .from('solves')
      .select('created_at, users(username)')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: true })

    if (error) throw error

  // Use any to avoid TypeScript complaints
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
    const { data, error } = await supabase.rpc('get_user_first_bloods', { p_user_id: userId })
    // console.log(data, error)
    if (error) throw error
    // data is expected to be array of { challenge_id }
    return (data || []).map((r: any) => r.challenge_id)
  } catch (err) {
    console.error('Error fetching first bloods (rpc):', err)
    return []
  }
}

/**
 * Get challenge flag (Admin only)
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

  return data; // data is already text (flag)
  } catch (err) {
    console.error('Unexpected error fetching flag:', err);
    return null;
  }
}


/**
 * Set challenge active / inactive (Admin only)
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
 * Get all solvers (Admin only) with pagination
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

/**
 * Get solvers for a specific username
 */
export async function getSolversByUsername(username: string) {
  const { data, error } = await supabase.rpc('get_solves_by_name', {
    p_username: username,
  });

  if (error) {
    console.error(`Error fetching solvers for ${username}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Get solvers for a specific challenge title (exact match)
 */
export async function getSolversByChallengeTitle(challengeTitle: string) {
  const { data, error } = await supabase.rpc('get_solves_by_challenge', {
    p_challenge_title: challengeTitle,
  });

  if (error) {
    console.error(`Error fetching solvers for challenge "${challengeTitle}":`, error);
    return [];
  }

  return data || [];
}

/** Delete a solver entry by solve ID (Admin only)
 */
export async function deleteSolver(solveId: string) {
  const { data, error } = await supabase.rpc("delete_solver", {
    p_solve_id: solveId,
  })

  if (error) throw error
  return data
}

/**
 * Get notifications (new challenges & first blood)
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
  // console.log(data)
  return data || [];
}

/**
 * Get recent solves formatted as notifications
 */
export async function getRecentSolves(limit = 100, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('solves')
      .select(`
        id,
        created_at,
        user_id,
        challenge_id,
        users(username),
        challenges(title, category)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return ((data as any[]) || []).map(row => ({
      notif_type: 'solve' as const,
      notif_challenge_id: row.challenge_id,
      notif_challenge_title: row.challenges?.title || 'Unknown Challenge',
      notif_category: row.challenges?.category || 'Misc',
      notif_user_id: row.user_id,
      notif_username: row.users?.username || 'Unknown',
      notif_created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching recent solves:', error);
    return [];
  }
}

/**
 * Subscribe to real-time solves (challenge solved events)
 * @param onSolve callback({ username, challenge }) dipanggil setiap ada solve baru
 * @returns unsubscribe function
 */
export function subscribeToSolves(onSolve: (payload: { username: string, challenge: string }) => void) {
  console.log('[subscribeToSolves] Subscribing to solves-insert channel...')
  const channel = supabase
    .channel('solves-insert')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solves' }, async (payload) => {
      try {
        if (!payload || !payload.new) {
          console.warn('[subscribeToSolves] Invalid payload:', payload)
          return;
        }
        let solve = payload.new;
        console.log('[subscribeToSolves] Payload.new:', solve)
        // Fallback: fetch latest solve if missing user_id or challenge_id
        if (!solve.user_id || !solve.challenge_id) {
          console.warn('[subscribeToSolves] Missing user_id or challenge_id:', solve)
          const { data: latestSolve, error: latestError } = await supabase
            .from('solves')
            .select('user_id, challenge_id')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latestError || !latestSolve || !latestSolve.user_id || !latestSolve.challenge_id) {
            console.warn('[subscribeToSolves] Still cannot get user_id or challenge_id from latest solve:', latestError, latestSolve)
            onSolve({ username: 'Unknown', challenge: 'Unknown' });
            return;
          }
          solve = latestSolve;
        }

        const { data, error } = await supabase
          .rpc('get_solve_info', {
            p_user_id: solve.user_id,
            p_challenge_id: solve.challenge_id
          });

        if (error) {
          console.warn('[subscribeToSolves] Error fetching solve info via RPC:', error);
          onSolve({ username: 'Unknown', challenge: 'Unknown' });
          return;
        }

        if (data && data.length > 0) {
          // Pastikan type string dan fallback jika null/undefined
          const username = typeof data[0].username === 'string' && data[0].username ? data[0].username : 'Unknown';
          const challenge = typeof data[0].challenge === 'string' && data[0].challenge ? data[0].challenge : 'Unknown';
          onSolve({ username, challenge });
          console.log(`[subscribeToSolves] Real-time solve: ${username} solved ${challenge}`);
        } else {
          onSolve({ username: 'Unknown', challenge: 'Unknown' });
        }
      } catch (err) {
        console.error('[subscribeToSolves] Error handling solve event:', err)
      }
    })
    .subscribe()
  // Return unsubscribe function
  return () => {
    console.log('[subscribeToSolves] Unsubscribing from solves-insert channel...')
    supabase.removeChannel(channel)
  }
}
