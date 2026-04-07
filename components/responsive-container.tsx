'use client'

import React from 'react'
import { useMobileOptimization } from '@/hooks/use-mobile-optimization'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  const { isMobile, touchCapable } = useMobileOptimization()

  return (
    <div
      className={`${className} ${isMobile ? 'pb-20' : ''}`}
      style={touchCapable ? { WebkitTouchCallout: 'none' } as React.CSSProperties : {}}
    >
      {children}
    </div>
  )
}

interface TouchButtonProps {
  children: React.ReactNode
  className?: string
  [key: string]: any
}

export function TouchButton({ children, className = '', ...props }: TouchButtonProps) {
  return (
    <button
      className={`${className} active:scale-95 transition-transform`}
      style={{ minHeight: '44px', minWidth: '44px' }}
      {...props}
    >
      {children}
    </button>
  )
}
