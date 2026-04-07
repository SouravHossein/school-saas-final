import type { ReactNode } from 'react'

export function AppEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/80 px-6 py-12 text-center">
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground md:text-base">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
