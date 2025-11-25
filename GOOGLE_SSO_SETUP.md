# Google SSO Setup Guide

This guide will walk you through setting up Google Single Sign-On (SSO) for your Next.js application using Supabase.

## Step-by-Step Configuration

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Dandi App")
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to **APIs & Services** → **Library**
   - Search for "Google+ API" or "Google Identity Services"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - Choose **External** (unless you have a Google Workspace)
     - Fill in the required fields:
       - App name: Your app name
       - User support email: Your email
       - Developer contact: Your email
     - Click **Save and Continue**
     - Add scopes: `email`, `profile`, `openid`
     - Click **Save and Continue**
     - Add test users (for development) or skip
     - Click **Back to Dashboard**

5. **Create OAuth Client ID**
   - Application type: **Web application**
   - Name: "Dandi Web Client" (or any name)
   - **Authorized JavaScript origins:**
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com`
   - **Authorized redirect URIs:**
     - For development: `http://localhost:3000/auth/callback`
     - For Supabase: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
     - For production: `https://yourdomain.com/auth/callback`
   - Click **Create**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

### Step 2: Configure Supabase Authentication

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Enable Google Provider**
   - Go to **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON**

3. **Add Google OAuth Credentials**
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
   - Click **Save**

4. **Configure Redirect URL**
   - In the same Google provider settings, make sure the redirect URL is:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - This should already be set by Supabase, but verify it matches what you added in Google Cloud Console

### Step 3: Verify Environment Variables

Make sure your `.env.local` file has the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

You can find these in:
- Supabase Dashboard → **Settings** → **API**

### Step 4: Test the Integration

1. **Start your development server:**
   ```bash
   yarn dev
   ```

2. **Visit your app:**
   - Go to `http://localhost:3000`
   - You should see the "Sign in with Google" button

3. **Test the login flow:**
   - Click "Sign in with Google"
   - You should be redirected to Google's login page
   - After signing in, you'll be redirected back to your app
   - You should see your profile picture and name, with a "Sign Out" button

### Step 5: Production Deployment

When deploying to production (e.g., Vercel):

1. **Update Google OAuth Credentials:**
   - Go back to Google Cloud Console
   - Edit your OAuth 2.0 Client ID
   - Add your production domain to:
     - **Authorized JavaScript origins**: `https://yourdomain.vercel.app` (or your custom domain)
     - **Authorized redirect URIs**: 
       - `https://yourdomain.vercel.app/auth/callback` (or your custom domain)
       - Keep the Supabase callback: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

2. **Update Supabase Settings (CRITICAL for Vercel):**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - **Site URL**: Set this to your production URL (e.g., `https://yourdomain.vercel.app`)
   - **Redirect URLs**: Add your production callback URL:
     - `https://yourdomain.vercel.app/auth/callback`
     - You can add multiple URLs (one per line) for different environments
   - **Important**: If you don't add the production redirect URL here, Supabase will redirect to localhost after OAuth!

3. **Environment Variables in Vercel:**
   - Go to your Vercel project → **Settings** → **Environment Variables**
   - Add/verify these variables:
     - `NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`
     - `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`
   - Make sure to set them for **Production** environment
   - Never commit `.env.local` to version control!

## Troubleshooting

### Common Issues:

1. **Redirecting to localhost after Google login (Vercel deployment)**
   - **Symptom**: After clicking "Sign in with Google" on Vercel, you're redirected to `http://localhost:3000/auth/callback` instead of your Vercel URL
   - **Solution**: 
     - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
     - Make sure **Site URL** is set to your Vercel production URL (e.g., `https://your-app.vercel.app`)
     - Add your production callback URL to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
     - Save the changes
     - The code already uses `window.location.origin` which automatically detects the correct domain, so the issue is always in Supabase configuration

2. **"redirect_uri_mismatch" error**
   - **Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
     - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Check for trailing slashes, http vs https, etc.

2. **"Invalid client" error**
   - **Solution**: Verify your Client ID and Client Secret are correct in Supabase
   - Make sure you copied the entire Client ID (it's usually a long string)

3. **"Access blocked" error**
   - **Solution**: If your app is in testing mode, add your email as a test user in Google Cloud Console
   - Go to **OAuth consent screen** → **Test users** → **Add users**

4. **Redirect not working**
   - **Solution**: Check that your callback route is accessible
   - Verify the route exists at `/auth/callback`
   - Check browser console for errors

5. **User not persisting after login**
   - **Solution**: Check that Supabase client is properly initialized
   - Verify environment variables are loaded
   - Check browser's Application → Cookies for Supabase session

### Debug Steps:

1. **Check browser console** for any JavaScript errors
2. **Check network tab** to see if OAuth requests are being made
3. **Verify Supabase logs**: Go to Supabase Dashboard → **Logs** → **Auth Logs**
4. **Test in incognito mode** to rule out cookie/session issues

## Security Best Practices

1. **Never expose your Client Secret** in client-side code
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production
4. **Regularly rotate** your OAuth credentials
5. **Monitor** authentication logs for suspicious activity
6. **Use Row Level Security (RLS)** in Supabase to protect user data

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)

## File Structure

The Google SSO implementation includes:

- `src/lib/supabase-client.js` - Client-side Supabase helper
- `src/contexts/AuthContext.js` - Authentication context and hooks
- `src/components/GoogleLoginButton.js` - Google login button component
- `src/components/AuthProviderWrapper.js` - Client wrapper for AuthProvider
- `src/app/auth/callback/route.js` - OAuth callback handler
- `src/app/layout.js` - Root layout with AuthProvider
- `src/app/page.js` - Home page with login button

## Next Steps

After setting up Google SSO, you can:

1. **Protect routes** by checking authentication status
2. **Access user data** using the `useAuth()` hook
3. **Link user data** to your database tables using `user.id`
4. **Add more providers** (GitHub, Apple, etc.) following the same pattern

