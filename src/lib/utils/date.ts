export function computeStreak(logs: Array<{ reviewed_at: string }>): number {
  if (logs.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const reviewDays = new Set(
    logs.map(log => {
      const d = new Date(log.reviewed_at)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  let streak = 0
  let checkDate = today.getTime()

  if (!reviewDays.has(checkDate)) {
    checkDate -= 86_400_000
  }

  while (reviewDays.has(checkDate)) {
    streak++
    checkDate -= 86_400_000
  }

  return streak
}

export function computeMastery(states: Array<{ state: number }>): number {
  if (states.length === 0) return 0
  const mature = states.filter(s => s.state === 2).length
  return Math.round((mature / states.length) * 100)
}
