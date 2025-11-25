'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [supabase] = useState(() => {
    try {
      return createBrowserClient();
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  });

  useEffect(() => {
    if (!supabase) {
      setError('Failed to initialize Supabase client. Please check your environment variables.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    let subscription = null;

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timed out')), 5000);
    });

    // Get initial session with error handling and timeout
    Promise.race([
      supabase.auth.getSession(),
      timeoutPromise
    ])
      .then((result) => {
        if (!isMounted) return;
        
        if (result && 'data' in result) {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            setError(sessionError.message);
          } else {
            setUser(session?.user ?? null);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error in getSession:', err);
        setError(err.message || 'Failed to get session');
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
      setError(null); // Clear error on successful auth state change
    });
    
    subscription = authSubscription;

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

