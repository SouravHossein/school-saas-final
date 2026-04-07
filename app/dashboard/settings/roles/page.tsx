'use client'

import { Suspense } from 'react'
import { RolesPageContent } from './roles-content'

function RolesSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-96"></div>
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}

export default function RolesPage() {
  return (
    <Suspense fallback={<RolesSkeleton />}>
      <RolesPageContent />
    </Suspense>
  )
}
