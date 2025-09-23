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
      return { user: null, error: 'Gagal membuat akun' }
    }

    // Buat profil user via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_profile', {
      p_id: authData.user.id,
      p_username: username
    });

    if (rpcError) {
      console.error('User creation error:', rpcError)
      return { user: null, error: `Gagal membuat profil user: ${rpcError.message}` }
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
    return { user: null, error: 'Terjadi kesalahan saat mendaftar' }
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'Gagal login' }
    }

    // Ambil data user dari tabel public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // Jika user tidak ada di tabel public.users, buat profil baru via RPC
      if (userError.code === 'PGRST116') {
        console.log('User not found in public.users, creating profile...');

        // Ambil username dari user metadata atau email
        const username = data.user.user_metadata?.username ||
                        data.user.user_metadata?.display_name ||
                        data.user.email?.split('@')[0] ||
                        'user_' + data.user.id.slice(0, 8);

        const { data: rpcData, error: rpcError } = await supabase.rpc('create_profile', {
          p_id: data.user.id,
          p_username: username
        });

        if (rpcError) {
          console.error('Failed to create user profile:', rpcError);
          return { user: null, error: 'Gagal membuat profil user' };
        }

        // Ambil lagi data user
        const { data: newUserData, error: newUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (newUserError) {
          return { user: null, error: newUserError.message };
        }

        return { user: newUserData, error: null };
      }

      return { user: null, error: userError.message };
    }

    return { user: userData, error: null };
  } catch (error) {
    return { user: null, error: 'Terjadi kesalahan saat login' }
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
