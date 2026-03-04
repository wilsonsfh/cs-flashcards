import {
  FSRS,
  createEmptyCard,
  generatorParameters,
  Rating,
  State,
  type Card as FsrsCard,
  type RecordLogItem,
} from 'ts-fsrs'
import type { CardFsrsState } from '@/types/database'

export type SchedulingResult = Record<number, RecordLogItem>

const defaultParams = generatorParameters({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: true,
  enable_short_term: true,
})

const fsrsInstance = new FSRS(defaultParams)

export function getFsrs(): FSRS {
  return fsrsInstance
}

export function dbStateToCard(state: CardFsrsState): FsrsCard {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    learning_steps: state.learning_steps,
    state: state.state as State,
    last_review: state.last_review ? new Date(state.last_review) : undefined,
  }
}

export function getSchedulingOptions(dbState: CardFsrsState, now = new Date()): SchedulingResult {
  const card = dbStateToCard(dbState)
  return getFsrs().repeat(card, now) as unknown as SchedulingResult
}

export function formatInterval(scheduledDays: number): string {
  if (scheduledDays === 0) return '<10m'
  if (scheduledDays < 1) return `${Math.round(scheduledDays * 24)}h`
  if (scheduledDays === 1) return '1d'
  if (scheduledDays < 30) return `${Math.round(scheduledDays)}d`
  if (scheduledDays < 365) return `${Math.round(scheduledDays / 30)}mo`
  return `${(scheduledDays / 365).toFixed(1)}y`
}

export { Rating, State, createEmptyCard }
