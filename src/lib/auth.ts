import { supabase } from './supabase'
import { User } from '@/types'

export interface AuthResponse {
  user: User | null
  error: string | null
}

/**
 * Sign in with Google OAuth
 */
export async function loginGoogle(): Promise<AuthResponse> {
  try {
    const redirectUrl = `${window.location.origin}/challenges`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      return { user: null, error: error.message }
    }
    return { user: null, error: null }
  } catch (error) {
    return { user: null, error: 'Google sign-in failed' }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/challenges` // redirect to forgot-password for new password input
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (error) {
    return { error: 'Failed to send reset email' }
  }
}

/**
 * Update current user's password
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'User not authenticated' }
    }
    // Update password directly
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (error) {
    return { error: 'Failed to update password' }
  }
}


/**
 * Register a new user
 */
export async function signUp(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
  // Validate only @gmail.com emails are allowed for registration
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return { user: null, error: 'Only @gmail.com emails are allowed for registration' }
    }

  // Check username in public.users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { user: null, error: 'Username already taken' };
    }

  // Sign up with Supabase Auth
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

  // Create user profile via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_profile', {
      p_id: authData.user.id,
      p_username: username
    });

    if (rpcError) {
      console.error('User creation error:', rpcError)
      return { user: null, error: `Failed to create user profile: ${rpcError.message}` }
    }

  // Fetch user data from the users table
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

  // If identifier is not an email, treat it as username → fetch email via RPC
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

  // Try to fetch from public.users
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
  // Auto-create profile if it doesn't exist
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

  // Fetch again
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

  // Fetch user profile via RPC
    let { data, error } = await supabase.rpc('get_user_profile', { p_id: user.id });
    let userData = data && data.length > 0 ? data[0] : null;

  // If not present, auto-create profile (e.g., Google login)
    if (!userData) {
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
  // Fetch again using RPC
      const { data: newData, error: newError } = await supabase.rpc('get_user_profile', { p_id: user.id });
      userData = newData && newData.length > 0 ? newData[0] : null;
      if (newError || !userData) {
        return null;
      }
    }
    console.log("Current user data:", userData);
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
  // No parameters required, just call is_admin()
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
