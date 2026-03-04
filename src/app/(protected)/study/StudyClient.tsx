'use client'

import { useRouter } from 'next/navigation'
import { useStudySession } from '@/lib/hooks/useStudySession'
import { FlashCard } from '@/components/study/FlashCard'
import { RatingButtons } from '@/components/study/RatingButtons'
import { StudyProgress } from '@/components/study/StudyProgress'
import { EmptyState } from '@/components/study/EmptyState'
import { Button } from '@/components/ui/button'
import type { CardWithFsrs, CardCategory } from '@/types/database'

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
  activeCategory?: CardCategory
}

export function StudyClient({ initialCards, categoryCounts, activeCategory }: StudyClientProps) {
  const router = useRouter()
  const {
    currentCard,
    sessionState,
    intervalPreviews,
    reviewCount,
    totalCards,
    flipCard,
    submitRating,
  } = useStudySession(initialCards)

  const totalDue = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
  const visibleCategories = CATEGORY_ORDER.filter(cat => (categoryCounts[cat] ?? 0) > 0)

  function selectCategory(category?: string) {
    if (category) {
      router.push(`/study?category=${category}`)
    } else {
      router.push('/study')
    }
  }

  if (sessionState === 'complete') {
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
            onClick={() => selectCategory()}
          >
            All ({totalDue})
          </Button>
          {visibleCategories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectCategory(cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat} ({categoryCounts[cat]})
            </Button>
          ))}
        </div>
      )}

      <StudyProgress current={reviewCount} total={totalCards} />

      <FlashCard
        card={currentCard}
        isFlipped={sessionState === 'back'}
        onFlip={flipCard}
      />

      {sessionState === 'back' && intervalPreviews && (
        <RatingButtons
          intervalPreviews={intervalPreviews}
          onRate={submitRating}
        />
      )}
    </div>
  )
}
