import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'hero-panel grid-pattern overflow-hidden rounded-[2rem] border border-white/55 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] md:p-8',
        className,
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-4">
          {eyebrow ? (
            <div className="inline-flex items-center rounded-full border border-primary/15 bg-white/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {eyebrow}
            </div>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {description}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          {actions}
          {children}
        </div>
      </div>
    </section>
  )
}
