'use client'

import BulkFeeAssignment from '@/components/bulk-fee-assignment'

export default function AssignFeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assign Fees to Students</h1>
        <p className="text-muted-foreground">
          Bulk assign fees to all students in a section
        </p>
      </div>
      <BulkFeeAssignment />
    </div>
  )
}
