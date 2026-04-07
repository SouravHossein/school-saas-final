'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AppPageHeader } from '@/components/app-page-header'
import { AppEmptyState } from '@/components/app-empty-state'

interface Student {
  id: string
  first_name: string
  last_name: string
  roll_number: string
  email: string
  phone: string
  status: string
  photo_url: string
  sections: {
    name: string
  }
}

interface Section {
  id: string
  name: string
}

export default function StudentsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, name')
          .eq('school_id', profileData.school_id)
          .order('name')

        if (sectionsError) throw sectionsError
        setSections(sectionsData || [])

        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(
            'id, first_name, last_name, roll_number, email, phone, status, photo_url, sections(name)'
          )
          .eq('school_id', profileData.school_id)
          .order('first_name')

        if (studentsError) throw studentsError
        setStudents(studentsData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSection = !selectedSection || student.sections?.name === selectedSection

    return matchesSearch && matchesSection
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Students"
        title="Students"
        description="Manage student profiles, enrollment records, and class placement with improved filtering and stronger page structure."
        actions={
          <Button asChild size="lg" className="gap-2">
            <Link href="/students/new">
              <Plus className="w-4 h-4" />
              Add Student
            </Link>
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.4rem] border border-white/55 bg-white/74 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Students</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{students.length}</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/55 bg-white/74 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Filtered</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{filteredStudents.length}</p>
          </div>
        </div>
      </AppPageHeader>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} of {students.length} students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.name}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {student.photo_url ? (
                          <div className="relative w-8 h-8">
                            <Image
                              src={student.photo_url}
                              alt={`${student.first_name} ${student.last_name}`}
                              fill
                              className="rounded object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-semibold">
                            {student.first_name[0]}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {student.first_name} {student.last_name}
                        </div>
                      </TableCell>
                      <TableCell>{student.roll_number || '—'}</TableCell>
                      <TableCell>{student.sections?.name || '—'}</TableCell>
                      <TableCell className="text-sm">{student.email || '—'}</TableCell>
                      <TableCell>{student.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === 'active'
                              ? 'default'
                              : student.status === 'inactive'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="capitalize"
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/students/${student.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <AppEmptyState
              icon={<Users className="h-6 w-6" />}
              title={searchQuery || selectedSection ? 'No students match these filters' : 'No students yet'}
              description={
                searchQuery || selectedSection
                  ? 'Try adjusting the search or section filter to find the student record you need.'
                  : 'Create the first student profile to start tracking enrollment, attendance, and fees.'
              }
              action={
                !searchQuery && !selectedSection ? (
                  <Button asChild variant="outline">
                    <Link href="/students/new">Add first student</Link>
                  </Button>
                ) : null
              }
            />
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
