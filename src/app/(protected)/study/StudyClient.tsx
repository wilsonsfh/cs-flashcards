'use client'

import { useStudySession } from '@/lib/hooks/useStudySession'
import { FlashCard } from '@/components/study/FlashCard'
import { RatingButtons } from '@/components/study/RatingButtons'
import { StudyProgress } from '@/components/study/StudyProgress'
import { EmptyState } from '@/components/study/EmptyState'
import type { CardWithFsrs } from '@/types/database'

interface StudyClientProps {
  initialCards: CardWithFsrs[]
}

export function StudyClient({ initialCards }: StudyClientProps) {
  const {
    currentCard,
    sessionState,
    intervalPreviews,
    reviewCount,
    totalCards,
    flipCard,
    submitRating,
  } = useStudySession(initialCards)

  if (sessionState === 'complete') {
    return <EmptyState reviewCount={reviewCount} />
  }

  if (!currentCard) return null

  return (
    <div className="space-y-8 py-4">
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
