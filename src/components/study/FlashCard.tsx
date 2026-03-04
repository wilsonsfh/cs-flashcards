'use client'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/CodeBlock'
import type { CardWithFsrs } from '@/types/database'
import { Badge } from '@/components/ui/badge'

interface FlashCardProps {
  card: CardWithFsrs
  isFlipped: boolean
  onFlip: () => void
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  const isCode = card.category === 'code'

  return (
    <div
      className="relative w-full max-w-2xl mx-auto cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <div
        className={cn(
          'relative w-full min-h-72 md:min-h-80',
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border bg-card p-8 flex flex-col items-center justify-center shadow-sm"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-widest">
            {card.category.replace('_', ' ')}
          </Badge>
          <p className="text-xl font-medium leading-relaxed text-center max-w-lg">
            {card.front}
          </p>
          <p className="text-sm text-muted-foreground mt-8">
            Tap to reveal answer
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border bg-card p-8 flex items-center justify-center shadow-sm overflow-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="w-full max-w-lg">
            {isCode ? (
              <CodeBlock code={card.back} />
            ) : (
              <p className="text-lg leading-relaxed text-center whitespace-pre-wrap">
                {card.back}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
