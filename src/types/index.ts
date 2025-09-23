export interface User {
  id: string
  username: string
  score: number
  rank?: number
  is_admin?: boolean
  created_at: string
  updated_at: string
}

export interface Attachment {
  name: string
  url: string
  type: 'file' | 'link'
}

export interface Challenge {
  id: string
  title: string
  description: string
  category: string
  points: number
  flag: string
  flag_hash: string
  hint?: string
  attachments?: Attachment[]
  difficulty: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Solve {
  id: string
  user_id: string
  challenge_id: string
  created_at: string
}

export interface ChallengeWithSolve extends Challenge {
  is_solved?: boolean
}

// export interface LeaderboardEntry {
//   id: string
//   username: string
//   score: number
//   rank: number
// }

export type LeaderboardEntry = {
  id: string
  username: string
  score: number
  rank: number
  progress: {
    date: string
    score: number
  }[]
}
