import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BookOpen, TrendingUp, AlertCircle, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function ParentPortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get guardian record linked to this user
  const { data: guardian } = await supabase
    .from('guardians')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!guardian) {
    return (
      <div className="space-y-8 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No guardian profile found for your account. Please contact the school administration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get linked students via student_guardians table
  const { data: guardianStudents } = await supabase
    .from('student_guardians')
    .select('student_id, is_primary')
    .eq('guardian_id', guardian.id)

  if (!guardianStudents || guardianStudents.length === 0) {
    return (
      <div className="space-y-8 p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No linked students found. Please contact the school to link your children to your account.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const studentIds = guardianStudents.map(gs => gs.student_id)

  // Get all linked students data
  const { data: studentsData } = await supabase
    .from('students')
    .select('*, sections(name, classes(name))')
    .in('id', studentIds)
    .order('first_name')

  // Get attendance data for all children
  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('student_id, status, attendance_date')
    .in('student_id', studentIds)
    .order('attendance_date', { ascending: false })

  // Get marks data for all children
  const { data: allMarks } = await supabase
    .from('marks')
    .select('student_id, marks_obtained, grade, is_passed, exams(name, exam_type), subjects(name)')
    .in('student_id', studentIds)
    .order('created_at', { ascending: false })

  // Get fee data for all children
  const { data: allFees } = await supabase
    .from('student_fees')
    .select('student_id, amount, amount_paid, status, fee_structures(name)')
    .in('student_id', studentIds)

  // Helper function to get student stats
  const getStudentStats = (studentId: string) => {
    const studentAttendance = allAttendance?.filter(a => a.student_id === studentId) || []
    const studentMarks = allMarks?.filter(m => m.student_id === studentId) || []
    const studentFees = allFees?.filter(f => f.student_id === studentId) || []

    const totalAttendance = studentAttendance.length
    const presentDays = studentAttendance.filter(a => a.status === 'present').length
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0

    const averageMarks = studentMarks.length > 0
      ? Math.round(studentMarks.reduce((sum, m) => sum + (m.marks_obtained || 0), 0) / studentMarks.length)
      : 0

    const totalFeeDue = studentFees.reduce((sum, f) => sum + f.amount, 0)
    const totalFeePaid = studentFees.reduce((sum, f) => sum + f.amount_paid, 0)
    const totalFeePending = totalFeeDue - totalFeePaid

    return {
      attendancePercentage,
      presentDays,
      averageMarks,
      marksCount: studentMarks.length,
      totalFeePaid,
      totalFeePending,
      totalFeeDue,
      recentMarks: studentMarks.slice(0, 5),
      recentAttendance: studentAttendance.slice(0, 10),
      fees: studentFees,
    }
  }

  // Calculate overall statistics
  const overallStats = studentsData?.reduce((acc, student) => {
    const stats = getStudentStats(student.id)
    return {
      avgAttendance: acc.avgAttendance + stats.attendancePercentage,
      totalFeePending: acc.totalFeePending + stats.totalFeePending,
      studentsCount: acc.studentsCount + 1,
    }
  }, { avgAttendance: 0, totalFeePending: 0, studentsCount: 0 }) || { avgAttendance: 0, totalFeePending: 0, studentsCount: 0 }

  const avgAttendanceOverall = overallStats.studentsCount > 0 ? Math.round(overallStats.avgAttendance / overallStats.studentsCount) : 0

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold">Welcome, {guardian.first_name}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Managing {studentsData?.length || 0} student{studentsData?.length !== 1 ? 's' : ''} • {guardian.relationship}
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentsData?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Linked to your account</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgAttendanceOverall}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all children</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <AlertCircle className="w-4 h-4" />
              Pending Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overallStats.totalFeePending > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${overallStats.totalFeePending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total due</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for each student */}
      <Tabs defaultValue={studentsData?.[0]?.id || ''} className="w-full">
        <TabsList className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(studentsData?.length || 1, 4)}, minmax(0, 1fr))` }}>
          {studentsData?.map(student => (
            <TabsTrigger key={student.id} value={student.id} className="text-xs sm:text-sm">
              {student.first_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {studentsData?.map(student => {
          const stats = getStudentStats(student.id)
          return (
            <TabsContent key={student.id} value={student.id} className="space-y-6">
              {/* Student Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{student.first_name} {student.last_name}</h2>
                    <p className="text-gray-600 mt-1">
                      {student.sections?.classes?.name} - {student.sections?.name} • Roll No: {student.roll_number}
                    </p>
                  </div>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.attendancePercentage}%</div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.presentDays} days present</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Average Marks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stats.averageMarks}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.marksCount} exams taken</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Fees Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">${stats.totalFeePaid}</div>
                    <p className="text-xs text-muted-foreground mt-1">of ${stats.totalFeeDue}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stats.totalFeePending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${stats.totalFeePending}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Due</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Marks */}
              {stats.recentMarks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exam Results</CardTitle>
                    <CardDescription>Latest marks and grades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentMarks.map((mark: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{mark.subjects?.name}</p>
                            <p className="text-xs text-gray-600">{mark.exams?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{mark.marks_obtained}</p>
                            <Badge variant={mark.is_passed ? 'default' : 'destructive'} className="text-xs">
                              {mark.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fee Details */}
              {stats.fees.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Structure</CardTitle>
                    <CardDescription>Payment status for each fee component</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.fees.map((fee: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{fee.fee_structures?.name}</p>
                            <Badge variant={fee.status === 'paid' ? 'default' : fee.status === 'partial' ? 'secondary' : 'destructive'}>
                              {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Paid / Total</span>
                            <span className="font-medium">${fee.amount_paid} / ${fee.amount}</span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((fee.amount_paid / fee.amount) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Attendance */}
              {stats.recentAttendance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                    <CardDescription>Last 10 days attendance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1">
                      {stats.recentAttendance.map((att: any, idx: number) => (
                        <div
                          key={idx}
                          className={`flex-1 h-12 rounded flex items-center justify-center text-xs font-semibold cursor-help ${
                            att.status === 'present' ? 'bg-green-100 text-green-800' :
                            att.status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                          title={new Date(att.attendance_date).toLocaleDateString()}
                        >
                          {att.status === 'present' ? '✓' : att.status === 'absent' ? '✗' : '~'}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-3">Green: Present | Red: Absent | Yellow: Leave</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
