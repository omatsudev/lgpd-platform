import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
}

export function StatsCard({ title, value, description, icon: Icon, trend, trendValue, color = 'blue' }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && <p className="text-xs text-gray-500">{description}</p>}
            {trendValue && (
              <p className={cn('text-xs font-medium', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500')}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
              </p>
            )}
          </div>
          <div className={cn('rounded-lg p-2.5', colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
