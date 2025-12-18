import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client - errors will be thrown at runtime when functions are called
// if environment variables are not set (see ensureSupabaseConfigured in adminData.ts)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      furniture_items: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          category: string
          image: string
          images: string[] | null
          in_stock: boolean
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          price: number
          category: string
          image: string
          images?: string[] | null
          in_stock?: boolean
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          category?: string
          image?: string
          images?: string[] | null
          in_stock?: boolean
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
    }
  }
}

