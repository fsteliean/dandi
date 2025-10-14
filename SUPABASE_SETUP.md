# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `dandi-api-keys`
   - Database Password: (create a strong password)
   - Region: Choose closest to your location
6. Click "Create new project"

## 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Create the Database Table

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `api_keys` table with proper structure
- Indexes for performance
- Row Level Security (RLS) policies
- User authentication integration

## 5. Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/dashboards`
3. Try creating a new API key
4. Check your Supabase dashboard → **Table Editor** → **api_keys** to see the data

## 6. Optional: Disable RLS for Development

If you want to test without authentication, you can temporarily disable RLS:

1. Go to **Authentication** → **Policies**
2. Find the `api_keys` table
3. Toggle off "Enable RLS" for development

**⚠️ Remember to re-enable RLS before production!**

## 7. Database Schema

The `api_keys` table includes:

- `id` - Primary key (auto-increment)
- `name` - API key name
- `key` - The actual API key string
- `monthly_limit` - Usage limit per month
- `permissions` - Array of permissions
- `created_at` - Creation timestamp
- `last_used` - Last usage timestamp
- `user_id` - Foreign key to auth.users (for multi-user support)

## Troubleshooting

### Common Issues:

1. **"Invalid API key"** - Check your environment variables
2. **"Table doesn't exist"** - Run the SQL schema first
3. **"Permission denied"** - Check RLS policies or disable temporarily
4. **Connection timeout** - Verify your project URL

### Debug Steps:

1. Check browser console for errors
2. Check server logs in terminal
3. Verify environment variables are loaded
4. Test database connection in Supabase dashboard
