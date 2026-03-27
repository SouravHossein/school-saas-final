'use client'

import { createClient } from '@/lib/supabase/client'
import StudentForm from '@/components/student-form'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewStudentPage() {
  const supabase = createClient()
  const router = useRouter()
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSchoolId = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setSchoolId(profileData.school_id)
      } catch (error) {
        console.error('Error fetching school ID:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolId()
  }, [supabase, router])

  if (isLoading) return <div>Loading...</div>
  if (!schoolId) return <div>Unable to load school information</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Student</h1>
        <p className="text-muted-foreground">
          Create a new student profile in your school
        </p>
      </div>
      <StudentForm schoolId={schoolId} />
    </div>
  )
}
