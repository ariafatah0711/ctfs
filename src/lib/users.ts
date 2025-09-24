// Get user detail (rank, solved challenges) via RPC
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { User, ChallengeWithSolve } from '@/types'

export type UserDetail = {
  id: string
  username: string
  rank: number | null
  score: number // 👈 tambahin ini
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
      score: data.user.score ?? 0, // 👈 ambil dari DB
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
