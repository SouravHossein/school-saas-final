'use client'

import { ReactNode } from 'react'

interface PermissionGuardProps {
  children: ReactNode
  fallback?: ReactNode
  hasPermission: boolean
}

/**
 * Component that conditionally renders children based on permission check
 */
export function PermissionGuard({ children, fallback, hasPermission }: PermissionGuardProps) {
  if (!hasPermission) {
    return fallback || <div className="p-4 text-center text-muted-foreground">You don&apos;t have permission to view this content.</div>
  }

  return <>{children}</>
}
