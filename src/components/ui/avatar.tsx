import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string
}

export function Avatar({ name, className, ...props }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() ?? 'U'
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary',
        className
      )}
      {...props}
    >
      {initial}
    </div>
  )
}

