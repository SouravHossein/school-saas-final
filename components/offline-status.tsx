'use client'

import { usePWA } from '@/hooks/use-pwa'
import { AlertCircle, Wifi } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function OfflineStatus() {
  const { isOnline } = usePWA()

  if (isOnline) {
    return null
  }

  return (
    <Alert variant="destructive" className="fixed top-0 left-0 right-0 m-0 rounded-none z-50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        You are offline. Some features may be limited. Last cached data is available.
      </AlertDescription>
    </Alert>
  )
}
