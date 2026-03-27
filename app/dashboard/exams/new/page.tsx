'use client'

import ExamForm from '@/components/exam-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function NewExamPage() {
  const [schoolId, setSchoolId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSchoolId = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        setSchoolId(data?.school_id || '')
      }
      setIsLoading(false)
    }

    fetchSchoolId()
  }, [])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Exam</h1>
        <p className="text-gray-600">Add a new examination</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamForm schoolId={schoolId} />
        </CardContent>
      </Card>
    </div>
  )
}
