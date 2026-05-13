import { supabase } from '@/lib/supabase/client'

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
