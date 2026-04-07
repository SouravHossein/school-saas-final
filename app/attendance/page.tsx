'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
import { Loader2 } from 'lucide-react'

interface AttendanceRecord {
  id: string
  attendance_date: string
  status: 'present' | 'absent' | 'late' | 'leave'
  remarks?: string
  student: {
    first_name: string
    last_name: string
    roll_number: string
  }
}

export default function AttendanceHistoryPage() {
  const supabase = createClient()
  const router = useRouter()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [schoolId, setSchoolId] = useState<string>('')

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (!profileData?.school_id) return

        setSchoolId(profileData.school_id)

        const { data: attendanceData, error } = await supabase
          .from('attendance')
          .select(
            `
            id,
            attendance_date,
            status,
            remarks,
            student:students(first_name, last_name, roll_number)
          `
          )
          .eq('school_id', profileData.school_id)
          .order('attendance_date', { ascending: false })

        if (error) throw error

        setRecords(attendanceData || [])
      } catch (err) {
        console.error('Error fetching attendance:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [supabase, router])

  // Apply filters
  useEffect(() => {
    let filtered = records

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.student.first_name.toLowerCase().includes(query) ||
          r.student.last_name.toLowerCase().includes(query) ||
          r.student.roll_number.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((r) => r.attendance_date >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((r) => r.attendance_date <= dateTo)
    }

    setFilteredRecords(filtered)
  }, [records, statusFilter, searchQuery, dateFrom, dateTo])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Attendance History</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Student</Label>
          <Input
            id="search"
            placeholder="Name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-from">From Date</Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-to">To Date</Label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {records.length === 0 ? 'No attendance records found' : 'No matching records'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.student.roll_number}</TableCell>
                  <TableCell>
                    {record.student.first_name} {record.student.last_name}
                  </TableCell>
                  <TableCell>
                    {new Date(record.attendance_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{record.remarks || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </div>
  )
}
