export type CardCategory = 'general' | 'code' | 'data_structures' | 'algorithms' | 'os' | 'networking' | 'custom'

export interface Card {
  id: string
  user_id: string
  front: string
  back: string
  category: CardCategory
  tags: string[]
  source_id: number | null
  created_at: string
  updated_at: string
}

export interface CardFsrsState {
  id: string
  card_id: string
  user_id: string
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  learning_steps: number
  state: number
  last_review: string | null
  updated_at: string
}

export interface ReviewLog {
  id: string
  card_id: string
  user_id: string
  rating: number
  state: number
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  last_elapsed_days: number
  scheduled_days: number
  reviewed_at: string
}

export interface CardWithFsrs extends Card {
  card_fsrs_state: CardFsrsState
}

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: Card
        Insert: Omit<Card, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
      }
      card_fsrs_state: {
        Row: CardFsrsState
        Insert: Omit<CardFsrsState, 'id' | 'updated_at'>
        Update: Partial<Omit<CardFsrsState, 'id' | 'updated_at'>>
      }
      review_logs: {
        Row: ReviewLog
        Insert: Omit<ReviewLog, 'id'>
        Update: Partial<Omit<ReviewLog, 'id'>>
      }
    }
  }
}
