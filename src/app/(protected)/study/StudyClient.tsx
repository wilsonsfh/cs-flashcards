'use client'

import { useMemo } from 'react'
import { useStudySession } from '@/lib/hooks/useStudySession'
import { FlashCard } from '@/components/study/FlashCard'
import { RatingButtons } from '@/components/study/RatingButtons'
import { StudyProgress } from '@/components/study/StudyProgress'
import { EmptyState } from '@/components/study/EmptyState'
import { Button } from '@/components/ui/button'
import type { CardWithFsrs } from '@/types/database'

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

interface StudyClientProps {
  initialCards: CardWithFsrs[]
  categoryCounts: Record<string, number>
}

export function StudyClient({ initialCards, categoryCounts }: StudyClientProps) {
  const {
    currentCard,
    isFlipped,
    isComplete,
    intervalPreviews,
    reviewCount,
    totalCards,
    flipCard,
    submitRating,
    activeCategory,
    switchCategory,
    reviewedCardIds,
  } = useStudySession(initialCards)

  // Dynamic category counts that decrease as cards are reviewed
  const dynamicCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const card of initialCards) {
      if (!reviewedCardIds.has(card.id)) {
        counts[card.category] = (counts[card.category] ?? 0) + 1
      }
    }
    return counts
  }, [initialCards, reviewedCardIds])

  const totalDue = Object.values(dynamicCounts).reduce((a, b) => a + b, 0)
  const visibleCategories = CATEGORY_ORDER.filter(cat => (categoryCounts[cat] ?? 0) > 0)

  if (isComplete) {
    return <EmptyState reviewCount={reviewCount} />
  }

  if (!currentCard) return null

  return (
    <div className="space-y-8 py-4">
      {/* Category selector */}
      {(visibleCategories.length > 0 || totalDue > 0) && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!activeCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchCategory(null)}
          >
            All ({totalDue})
          </Button>
          {visibleCategories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchCategory(cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat} ({dynamicCounts[cat] ?? 0})
            </Button>
          ))}
        </div>
      )}

      <StudyProgress current={reviewCount} total={totalCards} />

      <FlashCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={flipCard}
      />

      {isFlipped && intervalPreviews && (
        <RatingButtons
          intervalPreviews={intervalPreviews}
          onRate={submitRating}
        />
      )}
    </div>
  )
}
