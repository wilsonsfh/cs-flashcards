'use client'

import { Progress } from '@/components/ui/progress'

interface StudyProgressProps {
  current: number
  total: number
}

export function StudyProgress({ current, total }: StudyProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{current} reviewed</span>
        <span>{total - current} remaining</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
