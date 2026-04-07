'use client'

import { useParams } from 'next/navigation'
import FeeStructureForm from '@/components/fee-structure-form'

export default function EditFeePage() {
  const params = useParams()
  const feeId = params.id as string

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Fee Structure</h1>
        <p className="text-muted-foreground">
          Modify fee structure details
        </p>
      </div>
      <FeeStructureForm feeStructureId={feeId} />
    </div>
  )
}
