'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  rollNumber: string
  status: 'present' | 'absent' | 'leave' | null
  markedBy: string | null
}

export default function AttendancePage() {
  const router = useRouter()
  const supabase = createClient()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [sectionId, setSectionId] = useState<string>('')
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (!profile?.school_id) return

        // Get sections
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id, name, class_id')
          .eq('school_id', profile.school_id)

        setSections(sectionsData || [])
        if (sectionsData && sectionsData.length > 0) {
          setSectionId(sectionsData[0].id)
        }
      } catch (error) {
        console.error('[v0] Error fetching sections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!sectionId) return

    const fetchAttendance = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (!profile?.school_id) return

        const today = new Date().toISOString().split('T')[0]

        // Get students in section
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, first_name, last_name, roll_number')
          .eq('section_id', sectionId)
          .eq('status', 'active')

        // Get attendance records
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('section_id', sectionId)
          .eq('attendance_date', today)

        const attendanceMap = new Map(
          (attendanceData || []).map((a) => [a.student_id, a])
        )

        const attendanceRecords: AttendanceRecord[] = (studentsData || []).map((student) => {
          const record = attendanceMap.get(student.id)
          return {
            id: record?.id || '',
            studentId: student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            rollNumber: student.roll_number || 'N/A',
            status: record?.status || null,
            markedBy: record?.marked_by || null,
          }
        })

        setAttendance(attendanceRecords)
      } catch (error) {
        console.error('[v0] Error fetching attendance:', error)
      }
    }

    fetchAttendance()
  }, [sectionId])

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'leave') => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    )
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      for (const record of attendance) {
        if (record.status) {
          if (record.id) {
            // Update existing
            await supabase
              .from('attendance')
              .update({
                status: record.status,
                marked_by: user.id,
              })
              .eq('id', record.id)
          } else {
            // Insert new
            const { data: profile } = await supabase
              .from('profiles')
              .select('school_id')
              .eq('id', user.id)
              .single()

            await supabase.from('attendance').insert({
              school_id: profile?.school_id,
              section_id: sectionId,
              student_id: record.studentId,
              attendance_date: today,
              status: record.status,
              marked_by: user.id,
            })
          }
        }
      }

      setSuccessMessage('Attendance saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('[v0] Error saving attendance:', error)
      alert('Failed to save attendance. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'leave':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present':
        return <Badge variant="default">Present</Badge>
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>
      case 'leave':
        return <Badge variant="secondary">Leave</Badge>
      default:
        return <Badge variant="outline">Not Marked</Badge>
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground">Mark attendance for students</p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Section</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {attendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Sheet</CardTitle>
            <CardDescription>
              Mark attendance for {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.studentId}>
                    <TableCell>{record.rollNumber}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={record.status === 'present' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(record.studentId, 'present')}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={record.status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => handleStatusChange(record.studentId, 'absent')}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={record.status === 'leave' ? 'secondary' : 'outline'}
                          onClick={() => handleStatusChange(record.studentId, 'leave')}
                        >
                          Leave
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSaveAttendance} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
