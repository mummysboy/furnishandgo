# Environment Variables Setup

Create a `.env.local` file in the root of your project with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings: https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For admin operations (server-side only)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How to get your Supabase credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key
5. Paste them into your `.env.local` file

