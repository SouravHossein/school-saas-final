'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, X } from 'lucide-react'

interface Student {
  id: string
  roll_number: string
  first_name: string
  last_name: string
  attendance: {
    id?: string
    status: 'present' | 'absent' | 'late' | 'leave'
    remarks?: string
  }
}

interface AttendanceMarkerProps {
  sectionId: string
  schoolId: string
}

export function AttendanceMarker({
  sectionId,
  schoolId,
}: AttendanceMarkerProps) {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch students and their attendance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch students in section
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, roll_number, first_name, last_name')
          .eq('section_id', sectionId)
          .eq('school_id', schoolId)
          .order('roll_number', { ascending: true })

        if (studentsError) throw studentsError

        // Fetch attendance for selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, student_id, status, remarks')
          .eq('school_id', schoolId)
          .eq('section_id', sectionId)
          .eq('attendance_date', selectedDate)

        if (attendanceError) throw attendanceError

        const attendanceMap = new Map(
          attendanceData?.map((a) => [a.student_id, a]) || []
        )

        const enrichedStudents = (studentsData || []).map((student) => ({
          ...student,
          attendance: attendanceMap.get(student.id) || {
            status: 'present' as const,
            remarks: '',
          },
        }))

        setStudents(enrichedStudents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (sectionId) fetchData()
  }, [sectionId, selectedDate, schoolId, supabase])

  const updateAttendance = (
    studentId: string,
    status: 'present' | 'absent' | 'late' | 'leave',
    remarks = ''
  ) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, attendance: { ...s.attendance, status, remarks } } : s
      )
    )
  }

  const saveAttendance = async () => {
    setSaving(true)
    setError(null)
    try {
      const attendanceRecords = students.map((s) => ({
        school_id: schoolId,
        student_id: s.id,
        section_id: sectionId,
        attendance_date: selectedDate,
        status: s.attendance.status,
        remarks: s.attendance.remarks || null,
      }))

      // Use upsert to handle duplicate prevention
      const { error: upsertError } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,attendance_date',
        })

      if (upsertError) throw upsertError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'leave':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>
          Mark attendance for {students.length} students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selector */}
        <div className="space-y-2">
          <Label htmlFor="attendance-date">Attendance Date</Label>
          <Input
            id="attendance-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

        {/* Bulk Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setStudents(
                students.map((s) => ({
                  ...s,
                  attendance: { ...s.attendance, status: 'present' },
                }))
              )
            }
            disabled={loading || saving}
          >
            Mark All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setStudents(
                students.map((s) => ({
                  ...s,
                  attendance: { ...s.attendance, status: 'absent' },
                }))
              )
            }
            disabled={loading || saving}
          >
            Mark All Absent
          </Button>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No students found in this section
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.roll_number}</TableCell>
                    <TableCell>
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.attendance.status)}>
                        {student.attendance.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={student.attendance.status}
                        onValueChange={(value) =>
                          updateAttendance(
                            student.id,
                            value as 'present' | 'absent' | 'late' | 'leave'
                          )
                        }
                        disabled={loading || saving}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={saveAttendance}
            disabled={loading || saving || students.length === 0}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Attendance
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
