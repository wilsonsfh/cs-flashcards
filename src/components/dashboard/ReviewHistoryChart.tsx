'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ReviewHistoryChartProps {
  data: Array<{ date: string; count: number }>
}

export function ReviewHistoryChart({ data }: ReviewHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Review History (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No reviews yet. Start studying to see your progress!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis
                dataKey="date"
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
