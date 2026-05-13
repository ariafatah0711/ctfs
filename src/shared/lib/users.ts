import { supabase } from '@/lib/supabase/client'
import { User, ChallengeWithSolve } from '@/shared/types'
export {
  getUserByUsername,
  getUserDetail,
  getUserProfileLite,
  updateBio,
  updateProfilePicture,
  updateSosmed,
  updateUsername,
}
from '@/features/users/services/user-profile.service'
export type { UserDetail, UserProfileLite } from '@/features/users/services/user-profile.service'
export {
  getCategoryTotals,
  getDifficultyTotals,
}
from '@/features/users/services/user-stats.service'
export type { CategoryTotal, DifficultyTotal } from '@/features/users/services/user-stats.service'
export { getUsernameByEmail } from '@/features/admin/overview/services/audit-user-lookup.service'
export { getInfo } from '@/features/admin/overview/services/site-info.service'
export type { SiteInfo } from '@/features/admin/overview/services/site-info.service'

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
      .order('username', { ascending: true })

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
