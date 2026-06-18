
import type { ComponentType } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'red'
  trend?: {
    label: string
    value: number // percentage
    isUp: boolean
  }
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  trend
}: StatsCardProps) {
  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50'
  }[color] || 'bg-blue-50'

  const textColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  }[color] || 'text-blue-600'

  const Icon = icon

  return (
    <div className={`flex-1 ${bgColor} p-6 rounded-lg border border-gray-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <Icon className={`h-6 w-6 ${textColor}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span className={trend.isUp ? 'text-green-600' : 'text-red-600'}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}