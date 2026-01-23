import { cn } from '../../lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg shadow-xl shadow-blue-900/5 transition-all duration-300 hover:shadow-blue-900/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn('p-5 pb-2', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn('px-5 pb-5 pt-2 text-sm text-slate-700', className)} {...props}>
      {children}
    </div>
  )
}

