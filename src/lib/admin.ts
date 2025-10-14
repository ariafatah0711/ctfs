import { supabase } from './supabase'

// Check if current user is admin
export async function isAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return data
}
