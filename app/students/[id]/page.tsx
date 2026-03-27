'use client'

import { createClient } from '@/lib/supabase/client'
import StudentDeleteButton from '@/components/student-delete-button'
import GuardianForm from '@/components/guardian-form'
import { StudentAttendanceTab } from '@/components/student-attendance-tab'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  sections: {
    id: string
    name: string
  }
}

interface Guardian {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  relationship: string
  occupation: string
  is_primary: boolean
}

export default function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)

  const fetchStudent = async () => {
    try {
      // Get current user and school
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

      // Fetch student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(
          'id, first_name, last_name, email, phone, date_of_birth, gender, enrollment_date, roll_number, blood_group, address, city, state, postal_code, country, photo_url, status, notes, sections(id, name)'
        )
        .eq('id', params.id)
        .eq('school_id', profileData.school_id)
        .single()

      if (studentError) throw studentError
      setStudent(studentData)

      // Fetch guardians
      const { data: guardiansData, error: guardiansError } = await supabase
        .from('student_guardians')
        .select(
          'guardians(id, first_name, last_name, email, phone, relationship, occupation), is_primary'
        )
        .eq('student_id', params.id)

      if (guardiansError) throw guardiansError

      const formattedGuardians = guardiansData
        ?.map((sg: any) => ({
          ...sg.guardians,
          is_primary: sg.is_primary,
        }))
        .filter(Boolean) || []

      setGuardians(formattedGuardians)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudent()
  }, [params.id, supabase, router])

  if (isLoading) return <div>Loading...</div>
  if (!student) return <div>Student not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          {student.photo_url && (
            <div className="relative w-32 h-32">
              <Image
                src={student.photo_url}
                alt={`${student.first_name} ${student.last_name}`}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-muted-foreground">
              {student.sections?.name} • Roll No: {student.roll_number}
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className="capitalize">{student.status}</span>
              </p>
              {student.email && (
                <p>
                  <span className="font-semibold">Email:</span> {student.email}
                </p>
              )}
              {student.phone && (
                <p>
                  <span className="font-semibold">Phone:</span> {student.phone}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/students/${student.id}/edit`}>
            <Button>Edit</Button>
          </Link>
          <StudentDeleteButton
            studentId={student.id}
            studentName={`${student.first_name} ${student.last_name}`}
          />
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{student.gender || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{student.blood_group || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{student.phone || '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {student.address || '—'}
              </p>
              <p className="text-sm">
                {student.city && student.state && student.postal_code
                  ? `${student.city}, ${student.state} ${student.postal_code}`
                  : '—'}
              </p>
              {student.country && <p className="text-sm">{student.country}</p>}
            </CardContent>
          </Card>

          {student.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{student.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium">{student.sections?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{student.roll_number || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrollment Date</p>
                <p className="font-medium">
                  {student.enrollment_date
                    ? new Date(student.enrollment_date).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{student.status}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <StudentAttendanceTab studentId={student.id} />
        </TabsContent>

        <TabsContent value="guardians" className="space-y-6">
          {schoolId && (
            <GuardianForm
              studentId={student.id}
              schoolId={schoolId}
              onSave={fetchStudent}
            />
          )}

          {guardians.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Guardians List</CardTitle>
                <CardDescription>
                  {guardians.length} guardian{guardians.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead>Primary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guardians.map((guardian) => (
                        <TableRow key={guardian.id}>
                          <TableCell className="font-medium">
                            {guardian.first_name} {guardian.last_name}
                          </TableCell>
                          <TableCell>{guardian.relationship}</TableCell>
                          <TableCell>{guardian.phone}</TableCell>
                          <TableCell>{guardian.email || '—'}</TableCell>
                          <TableCell>{guardian.occupation || '—'}</TableCell>
                          <TableCell>
                            {guardian.is_primary ? (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                Yes
                              </span>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
