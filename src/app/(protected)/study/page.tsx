import { createClient } from '@/lib/supabase/server'
import { StudyClient } from './StudyClient'

export default async function StudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const now = new Date().toISOString()

  // Fetch all due cards (no category filter — switching is client-side)
  const [cardsResult, countsResult] = await Promise.all([
    supabase
      .from('cards')
      .select('*, card_fsrs_state(*)')
      .eq('user_id', user.id)
      .not('card_fsrs_state', 'is', null)
      .lte('card_fsrs_state.due', now)
      .order('card_fsrs_state(due)', { ascending: true })
      .limit(200),
    supabase.rpc('get_due_category_counts', { p_user_id: user.id, p_now: now }),
  ])

  const cards = cardsResult.data
  // Flatten: Supabase returns card_fsrs_state as array, take first
  const normalizedCards = (cards ?? [])
    .filter(c => c.card_fsrs_state && (Array.isArray(c.card_fsrs_state) ? c.card_fsrs_state.length > 0 : true))
    .map(c => ({
      ...c,
      card_fsrs_state: Array.isArray(c.card_fsrs_state) ? c.card_fsrs_state[0] : c.card_fsrs_state,
    }))

  // Build category counts map from RPC result, falling back to manual count
  const categoryCounts: Record<string, number> = {}
  if (countsResult.data && Array.isArray(countsResult.data)) {
    for (const row of countsResult.data) {
      categoryCounts[row.category] = Number(row.count)
    }
  } else {
    // Fallback: count from all due cards
    const { data: allDue } = await supabase
      .from('cards')
      .select('category, card_fsrs_state!inner(due)')
      .eq('user_id', user.id)
      .lte('card_fsrs_state.due', now)

    if (allDue) {
      for (const card of allDue) {
        categoryCounts[card.category] = (categoryCounts[card.category] ?? 0) + 1
      }
    }
  }

  return (
    <StudyClient
      initialCards={normalizedCards}
      categoryCounts={categoryCounts}
    />
  )
}
