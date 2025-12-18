/**
 * Migration script to seed Supabase database with initial furniture data
 * 
 * Usage:
 * 1. Set up your Supabase project and get your credentials
 * 2. Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. Run: node supabase/migrate-data.js
 * 
 * Or use the Supabase SQL editor to run the schema.sql and seed.sql files directly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Import furniture data (you'll need to adjust this path)
const { furnitureItems } = require('../data/furniture.ts')

async function migrateData() {
  console.log('Starting data migration...')

  try {
    // First, insert categories
    console.log('Inserting categories...')
    const categories = [...new Set(furnitureItems.map(item => item.category))]
    
    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert({ name: category }, { onConflict: 'name' })
      
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error(`Error inserting category ${category}:`, error)
      }
    }
    console.log(`✓ Inserted ${categories.length} categories`)

    // Then, insert furniture items
    console.log('Inserting furniture items...')
    const itemsToInsert = furnitureItems.map(item => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      images: item.images || null,
      in_stock: item.inStock,
      quantity: item.quantity || 0,
    }))

    // Insert in batches of 10
    const batchSize = 10
    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize)
      const { error } = await supabase
        .from('furniture_items')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} items)`)
      }
    }

    console.log(`✓ Migration complete! Inserted ${itemsToInsert.length} furniture items`)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateData()

