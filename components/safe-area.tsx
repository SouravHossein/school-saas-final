'use client'

'use client'

import { useEffect, useState } from 'react'

export function SafeAreaPadding() {
  const [safeAreas, setSafeAreas] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && 'CSS' in window && 'supports' in (window as any).CSS) {
      const hasEnv = (env: string) => (window as any).CSS.supports(`padding: max(0px, env(${env}))`)

      if (hasEnv('safe-area-inset-top')) {
        setSafeAreas({
          top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0,
          bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0,
          left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal')) || 0,
          right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar')) || 0,
        })
      }
    }
  }, [])

  return null
}

export function NotchPadding() {
  return (
    <style>{`
      :root {
        --sat: env(safe-area-inset-top);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
        --sar: env(safe-area-inset-right);
      }
      
      body {
        padding-top: max(0px, env(safe-area-inset-top));
        padding-bottom: max(0px, env(safe-area-inset-bottom));
        padding-left: max(0px, env(safe-area-inset-left));
        padding-right: max(0px, env(safe-area-inset-right));
      }
      
      @supports (padding: max(0px, env(safe-area-inset-bottom))) {
        main {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      }
    `}</style>
  )
}

