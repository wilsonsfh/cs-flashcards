import { createClient } from '@/lib/supabase/server'
import { StudyClient } from './StudyClient'

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  let query = supabase
    .from('cards')
    .select('*, card_fsrs_state(*)')
    .eq('user_id', user.id)
    .not('card_fsrs_state', 'is', null)
    .lte('card_fsrs_state.due', new Date().toISOString())
    .order('card_fsrs_state(due)', { ascending: true })
    .limit(50)

  if (params.category) {
    query = query.eq('category', params.category)
  }

  const { data: cards } = await query

  // Flatten: Supabase returns card_fsrs_state as array, take first
  const normalizedCards = (cards ?? [])
    .filter(c => c.card_fsrs_state && (Array.isArray(c.card_fsrs_state) ? c.card_fsrs_state.length > 0 : true))
    .map(c => ({
      ...c,
      card_fsrs_state: Array.isArray(c.card_fsrs_state) ? c.card_fsrs_state[0] : c.card_fsrs_state,
    }))

  return <StudyClient initialCards={normalizedCards} />
}
