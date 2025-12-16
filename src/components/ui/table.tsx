import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <table
        className={cn('w-full border-collapse text-sm text-slate-800', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-xs font-semibold text-slate-600" {...props} />
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-slate-100" {...props} />
}

export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className="transition-colors hover:bg-primary/5 focus-within:bg-primary/5 cursor-pointer"
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('px-4 py-3 text-left', className)} {...props} />
}

export function TableCell(props: HTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-3 align-middle text-sm text-slate-800" {...props} />
}

