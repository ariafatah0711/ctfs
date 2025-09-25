import { supabase } from './supabase'
import { User } from '@/types'

export interface AuthResponse {
  user: User | null
  error: string | null
}

/**
 * Login dengan Google OAuth
 */
export async function loginGoogle(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/challanges`,
      },
    })

    if (error) {
      return { user: null, error: error.message }
    }
    // User akan di-handle oleh AuthContext setelah redirect
    return { user: null, error: null }
  } catch (error) {
    return { user: null, error: 'Google sign-in failed' }
  }
}

/**
 * Sign up user baru
 */
export async function signUp(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
    // Validasi hanya email @gmail.com yang boleh daftar
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return { user: null, error: 'Only @gmail.com emails are allowed for registration' }
    }

    // Cek username di public.users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { user: null, error: 'Username already taken' };
    }

    // Sign up dengan Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // username: username,
          // display_name: username
        }
      }
    })

     if (authError?.message === 'User already registered') {
      return { user: null, error: "Email already registered" }
    }
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

    // Coba ambil dari public.users
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      // Auto create profile kalau belum ada
      const username =
        data.user.user_metadata?.username ??
        (data.user.email ? data.user.email.split("@")[0] : "user_" + data.user.id.substring(0, 8));

      const { error: rpcError } = await supabase.rpc('create_profile', {
        p_id: data.user.id,
        p_username: username
      });

      if (rpcError) {
        console.error("Auto create_profile error:", rpcError);
        return { user: null, error: 'Failed to create user profile' };
      }

      // Ambil ulang
      const { data: newUserData, error: newUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (newUserError) {
        return { user: null, error: newUserError.message };
      }

      userData = newUserData;
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

    // Cek user di tabel users
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Jika belum ada, auto-create profile (misal login Google)
    if (userError || !userData) {
      const username =
        user.user_metadata?.username ||
        (user.email ? user.email.split("@")[0] : "user_" + user.id.substring(0, 8));

      const { error: rpcError } = await supabase.rpc('create_profile', {
        p_id: user.id,
        p_username: username
      });
      if (rpcError) {
        console.error("Auto create_profile error:", rpcError);
        return null;
      }
      // Ambil ulang
      const { data: newUserData, error: newUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (newUserError) {
        return null;
      }
      userData = newUserData;
    }
    return userData;
  } catch (error) {
    return null;
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
