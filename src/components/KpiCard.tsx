import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../lib/utils'

export function KpiCard({
  title,
  value,
  description,
  suffix,
  isPlaceholder = false,
}: {
  title: string
  value: number
  description?: string
  suffix?: string
  isPlaceholder?: boolean
}) {
  return (
    <Card className={cn(isPlaceholder && 'bg-slate-50 border-dashed')}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {title}
          </p>
          <CardTitle className="text-3xl">
            {isPlaceholder ? (
              '...'
            ) : suffix ? (
              <span>
                {value} <span className="text-base text-slate-500">{suffix}</span>
              </span>
            ) : (
              `€ ${value.toLocaleString('it-IT')}`
            )}
          </CardTitle>
        </div>
        {!isPlaceholder && <ArrowUpRight className="h-5 w-5 text-slate-400" />}
      </CardHeader>
      {description && <CardContent className="text-sm text-slate-600">{description}</CardContent>}
    </Card>
  )
}
