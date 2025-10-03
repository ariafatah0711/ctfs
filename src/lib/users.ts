// Get user detail (rank, solved challenges) via RPC
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { User, ChallengeWithSolve } from '@/types'

export type UserDetail = {
  id: string
  username: string
  rank: number | null
  score: number
  picture?: string | null
  solved_challenges: ChallengeWithSolve[]
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  try {
    const { data, error }: PostgrestSingleResponse<any> = await supabase.rpc('detail_user', { p_id: userId })
    if (error || !data || !data.success) {
      console.error('Error fetching user detail:', error || data?.message)
      return null
    }
    return {
      id: data.user.id,
      username: data.user.username,
      rank: data.user.rank ?? null,
      score: data.user.score ?? 0,
      picture: data.user.picture ?? null,
      solved_challenges: (data.solved_challenges || []).map((c: any) => ({
        id: c.challenge_id,
        title: c.title,
        category: c.category,
        points: c.points,
        difficulty: c.difficulty,
        is_solved: true,
        solved_at: c.solved_at,
      })),
    }
  } catch (error) {
    console.error('Error fetching user detail:', error)
    return null
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching user by username:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
}

export async function getUserChallenges(userId: string): Promise<ChallengeWithSolve[]> {
  try {
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select(`
        *,
        attachments:challenge_attachments(*)
      `)
      .order('created_at', { ascending: false })

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError)
      return []
    }

    const { data: solves, error: solvesError } = await supabase
      .from('solves')
      .select('challenge_id')
      .eq('user_id', userId)

    if (solvesError) {
      console.error('Error fetching solves:', solvesError)
      return []
    }

    const solvedChallengeIds = new Set(solves.map(solve => solve.challenge_id))

    return challenges.map(challenge => ({
      ...challenge,
      is_solved: solvedChallengeIds.has(challenge.id),
      attachments: challenge.attachments || []
    }))
  } catch (error) {
    console.error('Error fetching user challenges:', error)
    return []
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}


// Get category totals (total challenge per kategori)
export type CategoryTotal = {
  category: string
  total_challenges: number
}

export async function getCategoryTotals(): Promise<CategoryTotal[]> {
  try {
    const { data, error } = await supabase.rpc('get_category_totals')

    if (error) {
      console.error('Error fetching category totals:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching category totals:', error)
    return []
  }
}

export type SiteInfo = {
  total_users: number
  total_admins: number
  total_solves: number
  unique_solvers: number
  total_challenges: number
  active_challenges: number
}

export async function getInfo(): Promise<SiteInfo | null> {
  try {
    const { data, error } = await supabase.rpc('get_info')
    if (error || !data) {
      console.error('Error fetching site info:', error)
      return null
    }
    // RPC returns a JSON object
    return {
      total_users: Number(data.total_users || 0),
      total_admins: Number(data.total_admins || 0),
      total_solves: Number(data.total_solves || 0),
      unique_solvers: Number(data.unique_solvers || 0),
      total_challenges: Number(data.total_challenges || 0),
      active_challenges: Number(data.active_challenges || 0),
    }
  } catch (err) {
    console.error('Error in getInfo:', err)
    return null
  }
}

// Update current user's username via RPC
export async function updateUsername(userId: string, newUsername: string): Promise<{ error: string | null, username?: string }> {
  try {
    const { data, error } = await supabase.rpc('update_username', {
      p_id: userId,
      p_username: newUsername
    });
    if (error || !data) {
      return { error: error?.message || 'Failed to update username' };
    }
    if (!data.success) {
      return { error: data.message || 'Failed to update username' };
    }
    return { error: null, username: data.username };
  } catch (error) {
    return { error: 'Failed to update username' };
  }
}
