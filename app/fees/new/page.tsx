'use client'

import FeeStructureForm from '@/components/fee-structure-form'

export default function NewFeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Fee Structure</h1>
        <p className="text-muted-foreground">
          Add a new fee type to your school
        </p>
      </div>
      <FeeStructureForm />
    </div>
  )
}
