import type { ReactNode } from 'react'

export function AppFormShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="section-shell">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
