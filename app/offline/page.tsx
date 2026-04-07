'use client'

import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">You are Offline</h1>
          <p className="text-gray-600">
            Your connection appears to be offline. Some cached data may be available.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">What you can do:</p>
          <ul className="space-y-1 text-left">
            <li>• View previously loaded pages</li>
            <li>• Check cached attendance and marks</li>
            <li>• Review stored student information</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/portal">
              <Home className="w-4 h-4 mr-2" />
              Back to Portal
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRetry}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Check your internet connection and try again when online
        </p>
      </div>
    </div>
  )
}

