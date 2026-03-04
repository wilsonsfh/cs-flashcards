import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createEmptyCard } from 'ts-fsrs'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user already has cards
  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count > 0) {
    return NextResponse.json({ seeded: false })
  }

  // Use service role for bulk insert
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: templates, error: fetchError } = await serviceClient
    .from('template_cards')
    .select('front, back, category, tags, source_id')

  if (fetchError || !templates) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }

  const BATCH_SIZE = 100
  for (let i = 0; i < templates.length; i += BATCH_SIZE) {
    const batch = templates.slice(i, i + BATCH_SIZE)

    const cardInserts = batch.map(t => ({
      user_id: user.id,
      front: t.front,
      back: t.back,
      category: t.category,
      tags: t.tags ?? [],
      source_id: t.source_id,
    }))

    const { data: insertedCards, error: cardError } = await serviceClient
      .from('cards')
      .insert(cardInserts)
      .select('id')

    if (cardError || !insertedCards) continue

    const emptyCard = createEmptyCard()
    const fsrsInserts = insertedCards.map(card => ({
      card_id: card.id,
      user_id: user.id,
      due: new Date().toISOString(),
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      learning_steps: emptyCard.learning_steps,
      state: emptyCard.state,
      last_review: null,
    }))

    await serviceClient.from('card_fsrs_state').insert(fsrsInserts)
  }

  return NextResponse.json({ seeded: true, count: templates.length })
}
