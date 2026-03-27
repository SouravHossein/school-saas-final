'use client'

import MarksEntry from '@/components/marks-entry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MarksEntryPage() {
  const params = useParams()
  const examId = params.id as string
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
        <h1 className="text-3xl font-bold">Mark Entry</h1>
        <p className="text-gray-600">Record marks for students</p>
      </div>

      <MarksEntry examId={examId} schoolId={schoolId} />
    </div>
  )
}
