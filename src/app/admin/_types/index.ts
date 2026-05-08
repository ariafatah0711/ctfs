import type { Attachment, Challenge, Event } from '@/shared/types'

export type { Attachment, Challenge, Event } from '@/shared/types'
export type { EventJoinRequestRow, EventMemberRow } from '@/shared/types'

export type SolverRow = {
  solve_id: string
  username: string
  challenge_title: string
  solved_at: string
}

export type SiteInfo = {
  total_users: number
  total_admins?: number
  total_solves: number
  unique_solvers?: number
}

export type ChallengeFormData = {
  title: string
  description: string
  category: string
  points: number | ''
  max_points: number | ''
  flag: string
  hint: string[]
  difficulty: string
  attachments: Attachment[]
  is_dynamic: boolean
  is_active: boolean
  is_maintenance: boolean
  min_points: number | ''
  decay_per_solve: number | ''
  event_id: string | null
  flag_placeholder: boolean
  services: string[]
}

export type SubChallengeFormRow = {
  id?: string
  question: string
  answer: string
  order_number: number | ''
  is_sequential: boolean
}
