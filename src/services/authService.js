import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Authentication & User Management Service for Supabase
 */
export const authService = {
  /**
   * Sign up a new user with Email, Password and Role metadata
   */
  async signUp(email, password, fullName = '', role = 'Technical Manager', section = 'Mechanical') {
    if (!isSupabaseConfigured) {
      console.warn('[AuthService] Supabase not configured. Using local demo sign-up.');
      return {
        user: { id: `local_${Date.now()}`, email },
        profile: { id: `local_${Date.now()}`, email, full_name: fullName, role, section },
        error: null
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            section
          }
        }
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('[AuthService] Sign-Up Error:', error.message);
      return { user: null, session: null, error: error.message };
    }
  },

  /**
   * Sign in existing user with Email & Password
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      console.warn('[AuthService] Supabase not configured. Using local demo sign-in.');
      return {
        user: { id: `demo_${Date.now()}`, email },
        session: { access_token: 'demo_token' },
        error: null
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('[AuthService] Sign-In Error:', error.message);
      return { user: null, session: null, error: error.message };
    }
  },

  /**
   * Social OAuth Sign-In (Google / GitHub)
   */
  async signInWithOAuth(provider = 'google') {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase credentials not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`[AuthService] OAuth Sign-In (${provider}) Error:`, error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Password Reset Request
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase credentials not configured' };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[AuthService] Password Reset Error:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Sign Out Current User
   */
  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('[AuthService] Sign-Out Error:', error.message);
      return { error: error.message };
    }
  },

  /**
   * Get Active Session & User
   */
  async getSession() {
    if (!isSupabaseConfigured) return { session: null, user: null };

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, user: session?.user || null };
    } catch (error) {
      console.error('[AuthService] GetSession Error:', error.message);
      return { session: null, user: null };
    }
  },

  /**
   * Fetch User Profile from 'profiles' table
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('[AuthService] GetProfile Error:', error.message);
      return null;
    }
  },

  /**
   * Listen to Auth State Changes
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return subscription;
  }
};
