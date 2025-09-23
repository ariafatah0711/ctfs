import { supabase } from './supabase'
import { User } from '@/types'

export interface AuthResponse {
  user: User | null
  error: string | null
}

/**
 * Sign up user baru
 */
export async function signUp(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
    // Sign up dengan Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username
        }
      }
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to create account' }
    }

    // Buat profil user via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_profile', {
      p_id: authData.user.id,
      p_username: username
    });

    if (rpcError) {
      console.error('User creation error:', rpcError)
      return { user: null, error: `Failed to create user profile: ${rpcError.message}` }
    }

    // Ambil data user dari tabel users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return { user: null, error: userError.message };
    }

    return { user: userData, error: null };
  } catch (error) {
  return { user: null, error: 'Registration failed' }
  }
}

/**
 * Sign in user
 */
export async function signIn(identifier: string, password: string): Promise<AuthResponse> {
  try {
    let email = identifier;

    // Kalau bukan email, berarti username → ambil email via RPC
    if (!identifier.includes('@')) {
      const { data: rpcEmail, error: rpcError } = await supabase.rpc('get_email_by_username', {
        p_username: identifier
      });

      if (rpcError || !rpcEmail) {
        return { user: null, error: 'User not found' };
      }

      email = rpcEmail;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Login failed' };
    }

    // Fetch user data dari public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      return { user: null, error: userError.message };
    }

    return { user: userData, error: null };
  } catch (error) {
    return { user: null, error: 'Login failed' };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return userData
  } catch (error) {
    return null
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // Tidak perlu parameter, cukup panggil is_admin()
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
