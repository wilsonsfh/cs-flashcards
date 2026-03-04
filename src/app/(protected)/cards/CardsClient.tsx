'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createEmptyCard } from 'ts-fsrs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CardWithFsrs, CardCategory } from '@/types/database'

const CATEGORIES: CardCategory[] = ['general', 'code', 'data_structures', 'algorithms', 'os', 'networking', 'custom']

interface CardsClientProps {
  initialCards: CardWithFsrs[]
  totalCount: number
  currentPage: number
  pageSize: number
  userId: string
}

export function CardsClient({ initialCards, totalCount, currentPage, pageSize, userId }: CardsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardWithFsrs | null>(null)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [category, setCategory] = useState<CardCategory>('general')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')

  const totalPages = Math.ceil(totalCount / pageSize)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`/cards?${params.toString()}`)
  }

  function handleCategoryFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    params.delete('page')
    router.push(`/cards?${params.toString()}`)
  }

  function openAddDialog() {
    setEditingCard(null)
    setFront('')
    setBack('')
    setCategory('general')
    setDialogOpen(true)
  }

  function openEditDialog(card: CardWithFsrs) {
    setEditingCard(card)
    setFront(card.front)
    setBack(card.back)
    setCategory(card.category)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!front.trim() || !back.trim()) return

    if (editingCard) {
      await supabase
        .from('cards')
        .update({ front, back, category })
        .eq('id', editingCard.id)
    } else {
      const { data: newCard } = await supabase
        .from('cards')
        .insert({ user_id: userId, front, back, category, tags: [] })
        .select('id')
        .single()

      if (newCard) {
        const emptyCard = createEmptyCard()
        await supabase.from('card_fsrs_state').insert({
          card_id: newCard.id,
          user_id: userId,
          due: emptyCard.due.toISOString(),
          stability: emptyCard.stability,
          difficulty: emptyCard.difficulty,
          elapsed_days: emptyCard.elapsed_days,
          scheduled_days: emptyCard.scheduled_days,
          reps: emptyCard.reps,
          lapses: emptyCard.lapses,
          learning_steps: emptyCard.learning_steps,
          state: emptyCard.state,
          last_review: null,
        })
      }
    }

    setDialogOpen(false)
    router.refresh()
  }

  async function handleDelete(cardId: string) {
    await supabase.from('cards').delete().eq('id', cardId)
    router.refresh()
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/cards?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cards</h1>
          <p className="text-muted-foreground text-sm">{totalCount} cards total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCard ? 'Edit Card' : 'Add Card'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as CardCategory)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Front (Question)</label>
                <Textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="What is..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Back (Answer)</label>
                <Textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="The answer is..."
                  className="mt-1"
                  rows={5}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingCard ? 'Save Changes' : 'Add Card'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <Select
          value={searchParams.get('category') ?? 'all'}
          onValueChange={handleCategoryFilter}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Front</TableHead>
              <TableHead className="w-1/3 hidden sm:table-cell">Back</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCards.map(card => (
              <TableRow key={card.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {card.front}
                </TableCell>
                <TableCell className="hidden sm:table-cell max-w-xs truncate text-muted-foreground">
                  {card.back}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {card.category.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {card.card_fsrs_state && (
                    <Badge variant={card.card_fsrs_state.state === 0 ? 'outline' : 'secondary'} className="text-xs">
                      {['New', 'Learning', 'Review', 'Relearning'][card.card_fsrs_state.state] ?? 'New'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(card)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {initialCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No cards found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
