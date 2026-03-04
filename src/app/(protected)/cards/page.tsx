import { createClient } from '@/lib/supabase/server'
import { CardsClient } from './CardsClient'

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const page = parseInt(params.page ?? '1', 10)
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('cards')
    .select('*, card_fsrs_state(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.q) {
    query = query.or(`front.ilike.%${params.q}%,back.ilike.%${params.q}%`)
  }

  const { data: cards, count } = await query

  const normalizedCards = (cards ?? []).map(c => ({
    ...c,
    card_fsrs_state: Array.isArray(c.card_fsrs_state) ? c.card_fsrs_state[0] : c.card_fsrs_state,
  }))

  return (
    <CardsClient
      initialCards={normalizedCards}
      totalCount={count ?? 0}
      currentPage={page}
      pageSize={pageSize}
      userId={user.id}
    />
  )
}
