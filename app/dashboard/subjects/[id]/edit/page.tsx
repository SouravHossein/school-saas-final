'use client'

import SubjectForm from '@/components/subject-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditSubjectPage() {
  const params = useParams()
  const subjectId = params.id as string
  const [subject, setSubject] = useState<any>(null)
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

          const { data: subjectData } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', subjectId)
            .eq('school_id', profileData?.school_id)
            .single()

          setSubject(subjectData)
        }
      } catch (error) {
        console.error('Error fetching subject:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [subjectId])

  if (isLoading) return <div>Loading...</div>
  if (!subject) return <div>Subject not found</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Subject</h1>
        <p className="text-gray-600">Update subject details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectForm initialData={subject} schoolId={schoolId} />
        </CardContent>
      </Card>
    </div>
  )
}
