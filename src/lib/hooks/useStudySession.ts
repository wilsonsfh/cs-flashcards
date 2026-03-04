'use client'

import { useState, useCallback, useMemo } from 'react'
import { Rating } from 'ts-fsrs'
import { getSchedulingOptions, formatInterval } from '@/lib/fsrs/scheduler'
import { createClient } from '@/lib/supabase/client'
import type { CardWithFsrs } from '@/types/database'

export type StudySessionState = 'front' | 'back' | 'complete'

export function useStudySession(initialCards: CardWithFsrs[]) {
  const supabase = createClient()
  const [cards] = useState(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionState, setSessionState] = useState<StudySessionState>(
    initialCards.length === 0 ? 'complete' : 'front'
  )
  const [reviewCount, setReviewCount] = useState(0)

  const currentCard = cards[currentIndex] ?? null

  const schedulingOptions = useMemo(() => {
    if (!currentCard?.card_fsrs_state) return null
    return getSchedulingOptions(currentCard.card_fsrs_state)
  }, [currentCard])

  const intervalPreviews = useMemo(() => {
    if (!schedulingOptions) return null
    return {
      [Rating.Again]: formatInterval(schedulingOptions[Rating.Again].card.scheduled_days),
      [Rating.Hard]: formatInterval(schedulingOptions[Rating.Hard].card.scheduled_days),
      [Rating.Good]: formatInterval(schedulingOptions[Rating.Good].card.scheduled_days),
      [Rating.Easy]: formatInterval(schedulingOptions[Rating.Easy].card.scheduled_days),
    }
  }, [schedulingOptions])

  const flipCard = useCallback(() => {
    if (sessionState === 'front') {
      setSessionState('back')
    }
  }, [sessionState])

  const submitRating = useCallback(async (rating: Rating) => {
    if (!currentCard || !schedulingOptions) return

    const chosen = schedulingOptions[rating]
    const now = new Date()

    const nextIndex = currentIndex + 1
    setReviewCount(r => r + 1)
    setCurrentIndex(nextIndex)
    setSessionState(nextIndex >= cards.length ? 'complete' : 'front')

    // Persist to Supabase
    await Promise.all([
      supabase
        .from('card_fsrs_state')
        .update({
          due: chosen.card.due.toISOString(),
          stability: chosen.card.stability,
          difficulty: chosen.card.difficulty,
          elapsed_days: chosen.card.elapsed_days,
          scheduled_days: chosen.card.scheduled_days,
          reps: chosen.card.reps,
          lapses: chosen.card.lapses,
          learning_steps: chosen.card.learning_steps,
          state: chosen.card.state,
          last_review: now.toISOString(),
        })
        .eq('card_id', currentCard.id),

      supabase
        .from('review_logs')
        .insert({
          card_id: currentCard.id,
          user_id: currentCard.user_id,
          rating,
          state: chosen.log.state,
          due: chosen.log.due.toISOString(),
          stability: chosen.log.stability,
          difficulty: chosen.log.difficulty,
          elapsed_days: chosen.log.elapsed_days,
          last_elapsed_days: chosen.log.last_elapsed_days,
          scheduled_days: chosen.log.scheduled_days,
          reviewed_at: now.toISOString(),
        }),
    ])
  }, [currentCard, schedulingOptions, currentIndex, cards.length, supabase])

  return {
    currentCard,
    sessionState,
    intervalPreviews,
    reviewCount,
    totalCards: cards.length,
    flipCard,
    submitRating,
  }
}
