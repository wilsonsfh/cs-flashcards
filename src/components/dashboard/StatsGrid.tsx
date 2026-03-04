import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Flame, Target, Library } from 'lucide-react'

interface StatsGridProps {
  dueCount: number
  totalCards: number
  masteryPct: number
  streak: number
}

export function StatsGrid({ dueCount, totalCards, masteryPct, streak }: StatsGridProps) {
  const stats = [
    {
      title: 'Due Now',
      value: dueCount,
      icon: BookOpen,
      description: 'cards to review',
    },
    {
      title: 'Streak',
      value: streak,
      icon: Flame,
      description: streak === 1 ? 'day' : 'days',
    },
    {
      title: 'Mastery',
      value: `${masteryPct}%`,
      icon: Target,
      description: 'cards matured',
    },
    {
      title: 'Total Cards',
      value: totalCards,
      icon: Library,
      description: 'in your deck',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ title, value, icon: Icon, description }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
