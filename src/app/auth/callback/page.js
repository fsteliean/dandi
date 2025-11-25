'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;
    let redirectTimeout = null;

    const handleAuthCallback = async () => {
      const supabase = createBrowserClient();
      
      // Set a safety timeout - always redirect after 5 seconds
      redirectTimeout = setTimeout(() => {
        if (mounted) {
          console.warn('Auth callback timeout - redirecting to home');
          router.replace('/');
        }
      }, 5000);

      try {
        // Check for error parameters first
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          clearTimeout(redirectTimeout);
          console.error('OAuth error:', error, errorDescription);
          router.replace(`/?error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        // Check for code parameter (PKCE flow)
        const code = searchParams.get('code');
        
        if (code) {
          try {
            // Exchange the code for a session
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            clearTimeout(redirectTimeout);

            if (exchangeError) {
              console.error('Error exchanging code for session:', exchangeError);
              router.replace(`/?error=${encodeURIComponent(exchangeError.message || 'exchange_failed')}`);
              return;
            }

            if (data?.session) {
              // Success - redirect to home
              router.replace('/');
              return;
            } else {
              console.error('No session returned from exchange');
              router.replace('/?error=no_session');
              return;
            }
          } catch (err) {
            clearTimeout(redirectTimeout);
            console.error('Unexpected error in callback:', err);
            router.replace(`/?error=${encodeURIComponent(err?.message || 'auth_failed')}`);
            return;
          }
        }

        // If no code, Supabase might have already handled it via detectSessionInUrl
        // Check if we have a session
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          clearTimeout(redirectTimeout);
          
          if (session) {
            // We have a session, redirect to home
            router.replace('/');
            return;
          }
          
          // No session and no code - something went wrong
          if (sessionError && !sessionError.message?.includes('session missing') && !sessionError.message?.includes('Auth session missing')) {
            console.error('Error checking session:', sessionError);
          }
          
          router.replace('/?error=auth_failed');
        } catch (err) {
          clearTimeout(redirectTimeout);
          // Handle errors gracefully
          if (!err?.message?.includes('session missing') && !err?.message?.includes('Auth session missing')) {
            console.error('Error checking session:', err);
          }
          router.replace('/?error=auth_failed');
        }
      } catch (err) {
        clearTimeout(redirectTimeout);
        console.error('Fatal error in auth callback:', err);
        router.replace('/?error=auth_failed');
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

