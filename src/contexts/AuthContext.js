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
    
    // Global error handler for uncaught Supabase auth errors
    const handleUnhandledError = (event) => {
      const error = event.error || event.reason;
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('session missing') || errorMessage.includes('Auth session missing') || errorMessage.includes('AuthSessionMissingError')) {
        // Prevent these errors from showing in the console/UI
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    
    const handleUnhandledRejection = (event) => {
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('session missing') || errorMessage.includes('Auth session missing') || errorMessage.includes('AuthSessionMissingError')) {
        // Prevent these errors from showing in the console/UI
        event.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Helper function to create user in users table
    const createUserIfNeeded = async (user) => {
      if (!user || !user.id || !user.email) {
        return;
      }

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          }),
        });

        const data = await response.json();
        if (data.success) {
          if (data.created) {
            console.log('New user created in database:', user.email);
          } else {
            console.log('User already exists in database:', user.email);
          }
        } else {
          console.error('Failed to create/check user:', data.error, data.details);
        }
      } catch (err) {
        // Don't throw - user creation failure shouldn't break the app
        console.error('Error creating user in database:', err);
      }
    };

    // Get initial session with error handling and timeout
    const getInitialSession = async () => {
      // Set a timeout to ensure loading doesn't hang forever
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Session check timed out, setting loading to false');
          setLoading(false);
          // Don't set user to null on timeout - might have a session
        }
      }, 3000); // 3 second timeout

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        // Always set user based on session, regardless of errors
        // If there's an error, we'll just treat it as "no session" which is fine
        if (sessionError) {
          const errorMessage = sessionError.message || '';
          // Only log non-session-missing errors
          if (!errorMessage.includes('session missing') && !errorMessage.includes('Auth session missing')) {
            console.warn('Session error (non-critical):', sessionError);
          }
        }
        
        // Set user based on session (will be null if no session, which is fine)
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setError(null); // Don't set error state - missing session is normal
        setLoading(false);
        
        // If we have a session, ensure user exists in users table
        if (currentUser) {
          createUserIfNeeded(currentUser);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        // Any error getting session just means no session - that's fine
        const errorMessage = err?.message || String(err) || '';
        if (!errorMessage.includes('session missing') && !errorMessage.includes('Auth session missing')) {
          console.warn('Error getting session (non-critical):', err);
        }
        
        // Treat any error as "no session" - this is the safe default
        setUser(null);
        setError(null);
        setLoading(false);
      }
      
      // Set up auth state listener AFTER initial session check
      // This prevents onAuthStateChange from throwing errors during initialization
      setTimeout(() => {
        if (!isMounted) return;
        
        try {
          const {
            data: { subscription: authSubscription },
          } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            try {
              // Always update user and loading state on auth state change
              setUser(session?.user ?? null);
              setLoading(false);
              setError(null); // Clear error on successful auth state change
              
              // Log for debugging
              if (_event === 'SIGNED_IN' && session?.user) {
                console.log('User signed in:', session.user.email);
                // Create user in users table if first time login
                createUserIfNeeded(session.user);
              } else if (_event === 'SIGNED_OUT') {
                console.log('User signed out');
              }
            } catch (err) {
              // Silently handle errors in the callback - don't let them break the app
              const errorMessage = err?.message || String(err) || '';
              if (!errorMessage.includes('session missing') && !errorMessage.includes('Auth session missing')) {
                console.warn('Error in auth state change handler:', err);
              }
              // Still set loading to false even on error
              setLoading(false);
            }
          });
          
          subscription = authSubscription;
        } catch (err) {
          // Silently handle setup errors - missing session is normal
          const errorMessage = err?.message || String(err) || '';
          if (!errorMessage.includes('session missing') && !errorMessage.includes('Auth session missing')) {
            console.warn('Error setting up auth state listener:', err);
          }
          // Continue anyway - the app should still work
        }
      }, 0);
    };

    getInitialSession();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    // Get the current origin (works in both dev and production)
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : '/auth/callback';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    if (!supabase) {
      // Even if supabase isn't initialized, clear local state
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
            localStorage.removeItem(key);
          }
        });
      }
      setUser(null);
      return; // Don't throw - just clear local state
    }
    
    // Always clear local storage first to ensure immediate UI update
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Force update user state immediately
    setUser(null);
    
    // Then try to sign out on the server (but don't fail if this errors)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Log but don't throw - we've already cleared local state
        const errorMessage = error.message || error.toString() || '';
        // Only log non-session errors as warnings
        if (!errorMessage.includes('session') && !errorMessage.includes('Session')) {
          console.warn('Sign out API error (non-critical, local state cleared):', error);
        }
      }
    } catch (err) {
      // Log but don't throw - we've already cleared local state
      const errorMessage = err?.message || err?.toString() || '';
      if (!errorMessage.includes('session') && !errorMessage.includes('Session')) {
        console.warn('Sign out error (non-critical, local state cleared):', err);
      }
    }
    
    // Always succeed from user's perspective
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

