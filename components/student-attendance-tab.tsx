'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface AttendanceRecord {
  id: string
  attendance_date: string
  status: 'present' | 'absent' | 'late' | 'leave'
  remarks?: string
}

interface StudentAttendanceTabProps {
  studentId: string
}

export function StudentAttendanceTab({ studentId }: StudentAttendanceTabProps) {
  const supabase = createClient()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
  })

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('id, attendance_date, status, remarks')
          .eq('student_id', studentId)
          .order('attendance_date', { ascending: false })

        if (error) throw error

        setRecords(data || [])

        // Calculate stats
        const total = data?.length || 0
        const statusCounts = {
          present: data?.filter((r) => r.status === 'present').length || 0,
          absent: data?.filter((r) => r.status === 'absent').length || 0,
          late: data?.filter((r) => r.status === 'late').length || 0,
          leave: data?.filter((r) => r.status === 'leave').length || 0,
        }

        setStats({
          total,
          ...statusCounts,
        })
      } catch (err) {
        console.error('Error fetching attendance:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [studentId, supabase])

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

  const attendancePercentage =
    stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Last 30 days of attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.slice(0, 30).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {record.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
