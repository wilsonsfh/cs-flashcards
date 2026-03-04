import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { ReviewHistoryChart } from '@/components/dashboard/ReviewHistoryChart'
import { computeStreak, computeMastery } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  algorithms: 'Algorithms',
  data_structures: 'Data Structures',
  os: 'OS',
  networking: 'Networking',
  code: 'Code',
  general: 'General',
  custom: 'Custom',
}

const CATEGORY_ORDER: string[] = [
  'algorithms',
  'data_structures',
  'os',
  'networking',
  'code',
  'general',
  'custom',
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [dueResult, statesResult, logsResult, categoryDueResult] = await Promise.all([
    supabase
      .from('card_fsrs_state')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('due', now.toISOString()),

    supabase
      .from('card_fsrs_state')
      .select('state')
      .eq('user_id', user.id),

    supabase
      .from('review_logs')
      .select('reviewed_at')
      .eq('user_id', user.id)
      .gte('reviewed_at', thirtyDaysAgo.toISOString())
      .order('reviewed_at', { ascending: false }),

    // Per-category due counts
    supabase
      .from('cards')
      .select('category, card_fsrs_state!inner(due)')
      .eq('user_id', user.id)
      .lte('card_fsrs_state.due', now.toISOString()),
  ])

  const dueCount = dueResult.count ?? 0
  const totalCards = statesResult.data?.length ?? 0
  const masteryPct = computeMastery(statesResult.data ?? [])
  const streak = computeStreak(logsResult.data ?? [])

  // Build category counts
  const categoryCounts: Record<string, number> = {}
  if (categoryDueResult.data) {
    for (const card of categoryDueResult.data) {
      categoryCounts[card.category] = (categoryCounts[card.category] ?? 0) + 1
    }
  }
  const visibleCategories = CATEGORY_ORDER.filter(cat => (categoryCounts[cat] ?? 0) > 0)

  // Aggregate review logs by date
  const reviewsByDate = new Map<string, number>()
  for (const log of logsResult.data ?? []) {
    const date = new Date(log.reviewed_at).toISOString().split('T')[0]
    reviewsByDate.set(date, (reviewsByDate.get(date) ?? 0) + 1)
  }

  // Fill in missing days
  const chartData: Array<{ date: string; count: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    chartData.push({ date: dateStr, count: reviewsByDate.get(dateStr) ?? 0 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your study overview</p>
        </div>
        {dueCount > 0 && (
          <Button asChild>
            <Link href="/study">
              <BookOpen className="h-4 w-4 mr-2" />
              Study Now ({dueCount})
            </Link>
          </Button>
        )}
      </div>

      {/* Category quick-links */}
      {visibleCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleCategories.map(cat => (
            <Button key={cat} variant="outline" size="sm" asChild>
              <Link href={`/study?category=${cat}`}>
                {CATEGORY_LABELS[cat] ?? cat} ({categoryCounts[cat]})
              </Link>
            </Button>
          ))}
        </div>
      )}

      <StatsGrid
        dueCount={dueCount}
        totalCards={totalCards}
        masteryPct={masteryPct}
        streak={streak}
      />

      <ReviewHistoryChart data={chartData} />
    </div>
  )
}
