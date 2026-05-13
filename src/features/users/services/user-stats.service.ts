import { supabase } from '@/lib/supabase/client'

export type CategoryTotal = {
  category: string
  total_challenges: number
}

export async function getCategoryTotals(eventId?: string | null, eventMode?: string): Promise<CategoryTotal[]> {
  try {
    const { data, error } = await supabase.rpc('get_category_totals', {
      p_event_id: eventId ?? null,
      p_event_mode: eventMode ?? (eventId ? 'equals' : 'any')
    })

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

export type DifficultyTotal = {
  difficulty: string
  total_challenges: number
}

export async function getDifficultyTotals(eventId?: string | null, eventMode?: string): Promise<DifficultyTotal[]> {
  try {
    const { data, error } = await supabase.rpc('get_difficulty_totals', {
      p_event_id: eventId ?? null,
      p_event_mode: eventMode ?? (eventId ? 'equals' : 'any')
    })

    if (error) {
      console.error('Error fetching difficulty totals:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching difficulty totals:', error)
    return []
  }
}
