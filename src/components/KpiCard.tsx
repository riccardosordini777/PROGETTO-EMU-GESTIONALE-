import { Card } from './ui/card'
import { TrendingUp } from 'lucide-react'
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
    <Card className={cn(
      "relative overflow-hidden group border-blue-100/50 transition-all hover:-translate-y-1",
      isPlaceholder && 'bg-slate-50/50 border-dashed'
    )}>
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all" />
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">
              {title}
            </p>
            <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              {isPlaceholder ? (
                <span className="animate-pulse">...</span>
              ) : suffix ? (
                <span className="flex items-baseline gap-2">
                  {value} <span className="text-lg font-medium text-slate-500">{suffix}</span>
                </span>
              ) : (
                <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  € {value.toLocaleString('it-IT')}
                </span>
              )}
            </h3>
          </div>
          {!isPlaceholder && (
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {description && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-medium">
             <div className="h-1 w-1 rounded-full bg-blue-400" />
             {description}
          </div>
        )}
      </div>
    </Card>
  )
}