import { supabase } from './supabase'

export type TeamMember = {
	user_id: string
	username: string
	role: 'captain' | 'member'
	joined_at: string
}

export type TeamInfo = {
	id: string
	name: string
	invite_code: string
	created_at: string
}

export async function createTeam(name: string): Promise<{ teamId?: string; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('create_team', { p_name: name })
		if (error) return { error: error.message }
		return { teamId: data as string }
	} catch (err: any) {
		return { error: err?.message || 'Failed to create team' }
	}
}

export async function joinTeam(inviteCode: string): Promise<{ teamId?: string; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('join_team', { p_invite_code: inviteCode })
		if (error) return { error: error.message }
		return { teamId: data as string }
	} catch (err: any) {
		return { error: err?.message || 'Failed to join team' }
	}
}

export async function leaveTeam(): Promise<{ success: boolean; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('leave_team')
		if (error) return { success: false, error: error.message }
		return { success: Boolean(data) }
	} catch (err: any) {
		return { success: false, error: err?.message || 'Failed to leave team' }
	}
}

export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('delete_team', { p_team_id: teamId })
		if (error) return { success: false, error: error.message }
		return { success: Boolean(data) }
	} catch (err: any) {
		return { success: false, error: err?.message || 'Failed to delete team' }
	}
}

export async function regenerateTeamInviteCode(teamId: string): Promise<{ invite_code?: string; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('regenerate_team_invite_code', { p_team_id: teamId })
		if (error) return { error: error.message }
		return { invite_code: data as string }
	} catch (err: any) {
		return { error: err?.message || 'Failed to regenerate invite code' }
	}
}

export async function getMyTeam(): Promise<{ team: TeamInfo | null; members: TeamMember[]; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_my_team')
		if (error) return { team: null, members: [], error: error.message }

		const team = data?.team ?? null
		const members = (data?.members ?? []) as TeamMember[]

		return { team, members }
	} catch (err: any) {
		return { team: null, members: [], error: err?.message || 'Failed to fetch team' }
	}
}

export type TeamSummary = {
	total_score: number
	unique_challenges: number
	total_solves: number
}

export type TeamScoreboardEntry = {
	team_id: string
	team_name: string
	unique_score: number
	total_score: number
	total_solves: number
	rank: number
}

export type TeamChallenge = {
	challenge_id: string
	title: string
	category: string
	points: number
	first_solved_at: string
	first_solver_username: string
}

export type TeamProgressPoint = {
	date: string
	score: number
}

export type TeamProgressSeries = {
	team_name: string
	history: TeamProgressPoint[]
}

export async function getMyTeamSummary(): Promise<{ team: TeamInfo | null; stats: TeamSummary | null; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_my_team_summary')
		if (error) return { team: null, stats: null, error: error.message }
		return { team: data?.team ?? null, stats: data?.stats ?? null }
	} catch (err: any) {
		return { team: null, stats: null, error: err?.message || 'Failed to fetch team summary' }
	}
}

export async function getMyTeamChallenges(): Promise<{ challenges: TeamChallenge[]; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_my_team_challenges')
		if (error) return { challenges: [], error: error.message }
		return { challenges: (data as TeamChallenge[]) || [] }
	} catch (err: any) {
		return { challenges: [], error: err?.message || 'Failed to fetch team challenges' }
	}
}

export async function getTeamByName(name: string): Promise<{ team: TeamInfo | null; members: TeamMember[]; stats: TeamSummary | null; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_team_by_name', { p_name: name })
		if (error) return { team: null, members: [], stats: null, error: error.message }
		if (!data?.success) return { team: null, members: [], stats: null, error: data?.message || 'Team not found' }
		return {
			team: data?.team ?? null,
			members: (data?.members ?? []) as TeamMember[],
			stats: data?.stats ?? null,
		}
	} catch (err: any) {
		return { team: null, members: [], stats: null, error: err?.message || 'Failed to fetch team' }
	}
}

export async function getTeamChallengesByName(name: string): Promise<{ challenges: TeamChallenge[]; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_team_challenges_by_name', { p_name: name })
		if (error) return { challenges: [], error: error.message }
		return { challenges: (data as TeamChallenge[]) || [] }
	} catch (err: any) {
		return { challenges: [], error: err?.message || 'Failed to fetch team challenges' }
	}
}

export async function getTeamScoreboard(limit = 100, offset = 0): Promise<{ entries: TeamScoreboardEntry[]; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_team_scoreboard', { limit_rows: limit, offset_rows: offset })
		if (error) return { entries: [], error: error.message }
		return { entries: (data as TeamScoreboardEntry[]) || [] }
	} catch (err: any) {
		return { entries: [], error: err?.message || 'Failed to fetch team scoreboard' }
	}
}

export async function getTopTeamProgressByNames(teamNames: string[]): Promise<Record<string, TeamProgressSeries>> {
	if (!teamNames || teamNames.length === 0) return {}
	try {
		const { data, error } = await supabase.rpc('get_team_solves_by_names', { p_names: teamNames })
		if (error) throw error
		const rows: Array<{ team_name: string; created_at: string; points: number }> = (data as any[]) || []

		const progress: Record<string, TeamProgressSeries> = {}
		for (const row of rows) {
			const name = row.team_name
			if (!name) continue
			if (!progress[name]) {
				progress[name] = { team_name: name, history: [] }
			}
			const prev = progress[name].history.at(-1)?.score || 0
			progress[name].history.push({
				date: row.created_at,
				score: prev + (row.points || 0),
			})
		}

		return progress
	} catch (err) {
		console.error('Error fetching team progress:', err)
		return {}
	}
}

export async function kickTeamMember(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('kick_team_member', {
			p_team_id: teamId,
			p_user_id: userId,
		})
		if (error) return { success: false, error: error.message }
		return { success: Boolean(data) }
	} catch (err: any) {
		return { success: false, error: err?.message || 'Failed to kick member' }
	}
}

export async function transferTeamCaptain(teamId: string, newCaptainUserId: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('transfer_team_captain', {
			p_team_id: teamId,
			p_new_captain_user_id: newCaptainUserId,
		})
		if (error) return { success: false, error: error.message }
		return { success: Boolean(data) }
	} catch (err: any) {
		return { success: false, error: err?.message || 'Failed to transfer captain' }
	}
}

export async function renameTeam(teamId: string, newName: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('rename_team', {
			p_team_id: teamId,
			p_new_name: newName,
		})
		if (error) return { success: false, error: error.message }
		return { success: Boolean(data) }
	} catch (err: any) {
		return { success: false, error: err?.message || 'Failed to rename team' }
	}
}

export async function getTeamByUserId(userId: string): Promise<{ team: TeamInfo | null; members: TeamMember[]; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('get_team_by_user_id', { p_user_id: userId })

		if (error) {
			console.error('RPC error:', error)
			return { team: null, members: [], error: error.message }
		}

		if (!data?.success) {
			return { team: null, members: [], error: data?.message || 'Failed to fetch team' }
		}

		console.log('getTeamByUserId data:', data)
		return {
			team: data?.team ?? null,
			members: (data?.members ?? []) as TeamMember[],
		}
	} catch (err: any) {
		console.error('getTeamByUserId error:', err)
		return { team: null, members: [], error: err?.message || 'Failed to fetch team' }
	}
}
