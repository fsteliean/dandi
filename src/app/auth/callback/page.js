'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createBrowserClient();
      
      // Check for error parameters first
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        router.push(`/?error=${encodeURIComponent(errorDescription || error)}`);
        return;
      }

      // Check for code parameter (PKCE flow)
      const code = searchParams.get('code');
      
      if (code) {
        try {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            router.push(`/?error=${encodeURIComponent(exchangeError.message || 'exchange_failed')}`);
            return;
          }

          if (data?.session) {
            // Success - redirect to home
            router.push('/');
            return;
          } else {
            console.error('No session returned from exchange');
            router.push('/?error=no_session');
            return;
          }
        } catch (err) {
          console.error('Unexpected error in callback:', err);
          router.push(`/?error=${encodeURIComponent(err.message || 'auth_failed')}`);
          return;
        }
      }

      // If no code, check if we already have a session (Supabase might have handled it)
      // This can happen if Supabase redirects directly to home
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // We have a session, redirect to home
          router.push('/');
          return;
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }

      // If we get here, something went wrong
      console.warn('No code parameter and no existing session in callback');
      // Wait a bit and check again - sometimes Supabase needs a moment
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.push('/');
          } else {
            router.push('/?error=auth_failed');
          }
        });
      }, 1000);
    };

    handleAuthCallback();
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

