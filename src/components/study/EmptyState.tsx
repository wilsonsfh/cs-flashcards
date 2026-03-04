import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  reviewCount?: number
}

export function EmptyState({ reviewCount = 0 }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-bold">All caught up!</h2>
      {reviewCount > 0 ? (
        <p className="text-muted-foreground">
          You reviewed {reviewCount} card{reviewCount !== 1 ? 's' : ''} this session.
        </p>
      ) : (
        <p className="text-muted-foreground">
          No cards are due for review right now.
        </p>
      )}
      <div className="flex gap-3 mt-4">
        <Button asChild variant="outline">
          <Link href="/">Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/cards">Browse Cards</Link>
        </Button>
      </div>
    </div>
  )
}
