import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

async function seedTemplate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const userId = process.env.MIGRATION_USER_ID

  if (!supabaseUrl || !serviceRoleKey || !userId) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MIGRATION_USER_ID')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: cards, error } = await supabase
    .from('cards')
    .select('front, back, category, tags, source_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch cards:', error)
    process.exit(1)
  }

  console.log(`Fetched ${cards.length} cards from user ${userId}`)

  const BATCH_SIZE = 100
  let inserted = 0

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE)
    const { error: insertError } = await supabase.from('template_cards').insert(batch)

    if (insertError) {
      console.error(`Insert error at batch ${i}:`, insertError)
      continue
    }

    inserted += batch.length
    console.log(`Progress: ${inserted}/${cards.length}`)
  }

  console.log('Template seeding complete.')
}

seedTemplate().catch(console.error)
