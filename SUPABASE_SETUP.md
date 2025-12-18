# Supabase Setup Guide

This guide will help you set up Supabase for the Furnish & Go application.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `furnish-and-go` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project" and wait for it to be set up (takes 1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL** - Copy this
   - **anon public** key - Copy this
3. Keep these credentials secure - you'll need them in the next step

## Step 3: Configure Environment Variables

1. In your project root, create a `.env.local` file (if it doesn't exist)
2. Add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

**Important:** Never commit `.env.local` to git - it's already in `.gitignore`

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL
5. You should see success messages for:
   - Creating tables
   - Creating indexes
   - Creating triggers
   - Setting up Row Level Security (RLS) policies
   - Creating policies for SELECT, INSERT, UPDATE, and DELETE operations

**Important:** The schema includes policies that allow public write access (INSERT/UPDATE/DELETE) for development. In production, you should replace these with authenticated admin policies for better security.

## Step 5: Seed Initial Data (Optional)

You have two options:

### Option A: Use SQL Seed File

1. In the SQL Editor, create a new query
2. Copy and paste the contents of `supabase/seed.sql`
3. Click "Run"

### Option B: Use Migration Script

1. Make sure you have Node.js installed
2. Install dotenv if needed: `npm install dotenv`
3. Run the migration script:
   ```bash
   node supabase/migrate-data.js
   ```

**Note:** The seed file only includes a few sample items. For the full dataset, use the migration script or manually import from `data/furniture.ts`.

## Step 6: Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see:
   - `furniture_items` table
   - `categories` table
3. Check that data was inserted correctly

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Visit [http://localhost:3000](http://localhost:3000)
3. The app should load furniture items from Supabase
4. **Important:** The application requires Supabase to be configured. If Supabase is not set up, you will see error messages instead of furniture items.

## Troubleshooting

### "Supabase environment variables are not set" warning

- Make sure `.env.local` exists in the project root
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env.local`

### Tables not found errors

- Make sure you ran the schema.sql file in the SQL Editor
- Check that tables exist in the Table Editor
- Verify you're using the correct project

### RLS (Row Level Security) blocking queries

- If you're getting 401 errors when trying to add/edit/delete items, the RLS policies may not be set up correctly
- Run the SQL from `supabase/update-policies.sql` in the SQL Editor to add the missing policies
- The schema.sql file includes all necessary policies, but if you created tables before updating the schema, you may need to run the update-policies.sql file
- In production, you should replace public write policies with authenticated admin policies for better security

### Data not appearing

- Check the browser console for errors
- Verify data exists in Supabase Table Editor
- Check that RLS policies allow public read access
- Try refreshing the page

## Next Steps

- Set up authentication if you want admin features to be protected
- Configure admin policies for write operations
- Set up backups for your database
- Consider using Supabase Edge Functions for server-side operations

## Support

For more help:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the application logs in the browser console

