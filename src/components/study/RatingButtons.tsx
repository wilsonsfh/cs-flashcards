'use client'

import { Button } from '@/components/ui/button'
import { Rating } from 'ts-fsrs'
import { cn } from '@/lib/utils'

interface RatingButtonsProps {
  intervalPreviews: Record<number, string>
  onRate: (rating: Rating) => void
  disabled?: boolean
}

const RATING_CONFIG = [
  { rating: Rating.Again, label: 'Again', color: 'text-red-500', bg: 'hover:bg-red-50 dark:hover:bg-red-950' },
  { rating: Rating.Hard, label: 'Hard', color: 'text-orange-500', bg: 'hover:bg-orange-50 dark:hover:bg-orange-950' },
  { rating: Rating.Good, label: 'Good', color: 'text-green-600', bg: 'hover:bg-green-50 dark:hover:bg-green-950' },
  { rating: Rating.Easy, label: 'Easy', color: 'text-blue-500', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950' },
]

export function RatingButtons({ intervalPreviews, onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="flex gap-2 sm:gap-3 justify-center mt-6 flex-wrap">
      {RATING_CONFIG.map(({ rating, label, color, bg }) => (
        <Button
          key={rating}
          variant="outline"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onRate(rating)
          }}
          className={cn('flex flex-col h-auto py-3 px-4 sm:px-5 min-w-16 sm:min-w-20', bg)}
        >
          <span className={cn('text-xs font-semibold', color)}>
            {intervalPreviews[rating]}
          </span>
          <span className="text-sm font-medium mt-1">{label}</span>
        </Button>
      ))}
    </div>
  )
}
