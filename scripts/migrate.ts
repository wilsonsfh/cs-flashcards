import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import Database from 'better-sqlite3'
import { createClient } from '@supabase/supabase-js'
import { createEmptyCard } from 'ts-fsrs'
import { classifyCard } from './classify'

async function migrate() {
  const dbPath = process.argv[2]
  if (!dbPath) {
    console.error('Usage: npx ts-node --esm scripts/migrate.ts <path-to-sqlite-db>')
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const userId = process.env.MIGRATION_USER_ID

  if (!supabaseUrl || !serviceRoleKey || !userId) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MIGRATION_USER_ID')
    process.exit(1)
  }

  const db = new Database(dbPath)
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const rows = db
    .prepare('SELECT id, type, front, back, known FROM cards')
    .all() as Array<{ id: number; type: number; front: string; back: string; known: number }>

  console.log(`Found ${rows.length} cards to migrate...`)

  const BATCH_SIZE = 50
  let inserted = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    const cardInserts = batch.map(row => ({
      user_id: userId,
      front: row.front,
      back: row.back,
      category: classifyCard(row.front, row.back, row.type),
      tags: [],
      source_id: row.id,
    }))

    const { data: insertedCards, error: cardError } = await supabase
      .from('cards')
      .insert(cardInserts)
      .select('id, source_id')

    if (cardError) {
      console.error(`Card insert error at batch ${i}:`, cardError)
      continue
    }

    const fsrsInserts = insertedCards!.map(insertedCard => {
      const originalRow = batch.find(r => r.id === insertedCard.source_id)!
      const emptyCard = createEmptyCard()

      return {
        card_id: insertedCard.id,
        user_id: userId,
        due: originalRow.known
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : new Date().toISOString(),
        stability: emptyCard.stability,
        difficulty: emptyCard.difficulty,
        elapsed_days: emptyCard.elapsed_days,
        scheduled_days: originalRow.known ? 14 : emptyCard.scheduled_days,
        reps: originalRow.known ? 1 : 0,
        lapses: emptyCard.lapses,
        learning_steps: emptyCard.learning_steps,
        state: originalRow.known ? 2 : 0,
        last_review: originalRow.known ? new Date().toISOString() : null,
      }
    })

    const { error: fsrsError } = await supabase
      .from('card_fsrs_state')
      .insert(fsrsInserts)

    if (fsrsError) {
      console.error(`FSRS state insert error at batch ${i}:`, fsrsError)
    }

    inserted += batch.length
    console.log(`Progress: ${inserted}/${rows.length}`)
  }

  console.log('Migration complete.')
  db.close()
}

migrate().catch(console.error)
