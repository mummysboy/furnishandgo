# Furnish & Go

A modern furniture sales website with UK English copy and Jewish/Yiddish humour. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Clean, professional design with smooth animations
- UK English copy throughout
- Jewish/Yiddish humour woven into product descriptions
- Responsive design that works on all devices
- Modern Next.js 14 with App Router
- TypeScript for type safety
- Supabase integration for database management
- Real-time inventory tracking
- Admin panel for managing furniture and categories

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://app.supabase.com)
2. Go to Settings → API and copy your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. Open the Supabase SQL Editor
2. Run the SQL from `supabase/schema.sql` to create the tables
3. (Optional) Run the SQL from `supabase/seed.sql` to add sample data, or use the migration script:

```bash
# Install dotenv if needed
npm install dotenv

# Run migration (adjust path to furniture data as needed)
node supabase/migrate-data.js
```

**Important:** Supabase is required for this application. The app will not work without proper Supabase configuration.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components
- `data/` - Furniture data and types
- `lib/` - Utility functions and Supabase client
- `supabase/` - Database schema and migration scripts
- `public/` - Static assets (add your logo here)

## Database Schema

The application uses Supabase with the following tables:

- `furniture_items` - Stores all furniture products with inventory tracking
- `categories` - Stores furniture categories

See `supabase/schema.sql` for the complete schema definition.

## Customisation

To match your logo's theme:
1. Update the colour scheme in `tailwind.config.js`
2. Replace the logo placeholder in `components/Header.tsx`
3. Adjust the primary colours to match your brand

## Build for Production

```bash
npm run build
npm start
```


