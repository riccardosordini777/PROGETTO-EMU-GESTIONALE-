import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'success' | 'danger' | 'info' | 'warning'

const styles: Record<Variant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-100 text-rose-700 border-rose-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
}

export function Badge({
  className,
  variant = 'info',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        styles[variant],
        className
      )}
      {...props}
    />
  )
}

