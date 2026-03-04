import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { classifyCard } from './classify'


async function recategorize() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Fetch all cards currently categorized as 'general'
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, front, back, category')
    .eq('category', 'general')

  if (error) {
    console.error('Error fetching cards:', error)
    process.exit(1)
  }

  console.log(`Found ${cards.length} general cards to re-classify...`)

  const updates: Array<{ id: string; category: string }> = []

  for (const card of cards) {
    const newCategory = classifyCard(card.front, card.back, 1)
    if (newCategory !== 'general') {
      updates.push({ id: card.id, category: newCategory })
    }
  }

  console.log(`${updates.length} cards will be reclassified:`)

  // Count by new category
  const counts: Record<string, number> = {}
  for (const u of updates) {
    counts[u.category] = (counts[u.category] ?? 0) + 1
  }
  console.log(counts)

  // Batch update in groups of 50
  const BATCH_SIZE = 50
  let updated = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)

    const promises = batch.map(({ id, category }) =>
      supabase.from('cards').update({ category }).eq('id', id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error(`${errors.length} errors in batch starting at ${i}`)
    }

    updated += batch.length
    console.log(`Progress: ${updated}/${updates.length}`)
  }

  console.log('Recategorization complete.')
}

recategorize().catch(console.error)
