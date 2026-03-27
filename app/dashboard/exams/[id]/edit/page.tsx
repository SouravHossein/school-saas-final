'use client'

import ExamForm from '@/components/exam-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditExamPage() {
  const params = useParams()
  const examId = params.id as string
  const [exam, setExam] = useState<any>(null)
  const [schoolId, setSchoolId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('school_id')
            .eq('id', user.id)
            .single()

          setSchoolId(profileData?.school_id || '')

          const { data: examData } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .eq('school_id', profileData?.school_id)
            .single()

          setExam(examData)
        }
      } catch (error) {
        console.error('Error fetching exam:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [examId])

  if (isLoading) return <div>Loading...</div>
  if (!exam) return <div>Exam not found</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Exam</h1>
        <p className="text-gray-600">Update exam details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamForm initialData={exam} schoolId={schoolId} />
        </CardContent>
      </Card>
    </div>
  )
}
