'use client'

import { createClient } from '@/lib/supabase/client'
import StudentForm from '@/components/student-form'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  enrollment_date: string
  roll_number: string
  blood_group: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  photo_url: string
  status: string
  notes: string
  section_id: string
}

export default function EditStudentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [schoolId, setSchoolId] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudent = async () => {
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

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(
            'id, first_name, last_name, email, phone, date_of_birth, gender, enrollment_date, roll_number, blood_group, address, city, state, postal_code, country, photo_url, status, notes, section_id'
          )
          .eq('id', params.id)
          .eq('school_id', profileData.school_id)
          .single()

        if (studentError) throw studentError
        setStudent(studentData)
      } catch (error) {
        console.error('Error fetching student:', error)
        router.push('/students')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [params.id, supabase, router])

  if (isLoading) return <div>Loading...</div>
  if (!student || !schoolId) return <div>Student not found</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Student</h1>
        <p className="text-muted-foreground">
          Update {student.first_name} {student.last_name}&apos;s information
        </p>
      </div>
      <StudentForm initialData={student} schoolId={schoolId} />
    </div>
  )
}
