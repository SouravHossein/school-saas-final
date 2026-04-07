'use client'

import { usePWA } from '@/hooks/use-pwa'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { useState } from 'react'

export function PWAInstallPrompt() {
  const { installPrompt, isInstalled, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (isInstalled || !installPrompt || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs text-gray-600 mt-1">Get quick access to SchoolMS on your device</p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={installApp} className="flex-1">
          Install
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDismissed(true)} className="flex-1">
          Later
        </Button>
      </div>
    </div>
  )
}
