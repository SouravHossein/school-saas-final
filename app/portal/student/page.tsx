import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Calendar, BookOpen, DollarSign, TrendingUp, Award, Clock } from 'lucide-react'

export default async function StudentPortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get student record linked to this user
  const { data: student } = await supabase
    .from('students')
    .select('*, sections(name, classes(name))')
    .eq('user_id', user.id)
    .single()

  if (!student) {
    return (
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold">Student Portal</h1>
          <p className="text-muted-foreground mt-2">
            No student record found for your account
          </p>
        </div>
      </div>
    )
  }

  // Get attendance data
  const { data: attendanceData } = await supabase
    .from('attendance')
    .select('status, attendance_date')
    .eq('student_id', student.id)
    .order('attendance_date', { ascending: false })

  // Get marks/results with all details
  const { data: marksData } = await supabase
    .from('marks')
    .select('*, exams(name, exam_type, exam_date, max_marks), subjects(name, code)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  // Get fee information
  const { data: feeData } = await supabase
    .from('student_fees')
    .select('*, fee_structures(name, frequency)')
    .eq('student_id', student.id)

  // Get upcoming exams
  const { data: examsData } = await supabase
    .from('exams')
    .select('*, classes(name)')
    .eq('class_id', student.section_id)
    .eq('is_published', true)
    .gte('exam_date', new Date().toISOString())
    .order('exam_date', { ascending: true })
    .limit(5)

  // Calculate statistics
  const totalAttendance = attendanceData?.length || 0
  const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0
  const absentDays = attendanceData?.filter(a => a.status === 'absent').length || 0
  const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0

  const totalFeeDue = feeData?.reduce((sum, f) => sum + f.amount, 0) || 0
  const totalFeePaid = feeData?.reduce((sum, f) => sum + f.amount_paid, 0) || 0
  const totalFeePending = totalFeeDue - totalFeePaid

  const averageMarks = marksData && marksData.length > 0
    ? Math.round(marksData.reduce((sum, m) => sum + (m.marks_obtained || 0), 0) / marksData.length)
    : 0

  const passedExams = marksData?.filter(m => m.is_passed).length || 0

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold">Welcome, {student.first_name}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          {student.sections?.classes?.name} - {student.sections?.name} | Roll No: {student.roll_number}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {presentDays} Present | {absentDays} Absent
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              Average Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{averageMarks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {marksData?.length || 0} Exams Taken
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">${totalFeePaid}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending: ${totalFeePending}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4" />
              Passed Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{passedExams}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {marksData?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Overview</CardTitle>
              <CardDescription>Your current academic status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Enrollment Status</p>
                  <Badge className="mt-2" variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Enrollment Date</p>
                  <p className="font-medium mt-2">{new Date(student.enrollment_date).toLocaleDateString()}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium mt-2">{new Date(student.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium mt-2 capitalize">{student.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
              <CardDescription>Your marks and grades for all exams</CardDescription>
            </CardHeader>
            <CardContent>
              {marksData && marksData.length > 0 ? (
                <div className="space-y-3">
                  {marksData.map((mark: any) => (
                    <div key={mark.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-semibold">{mark.subjects?.name}</p>
                        <p className="text-sm text-gray-600">{mark.exams?.name} • {mark.exams?.exam_type.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{mark.marks_obtained}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={mark.is_passed ? 'default' : 'destructive'}>
                            {mark.grade}
                          </Badge>
                          <span className="text-sm text-gray-600">{mark.is_passed ? '✓ Passed' : '✗ Failed'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">No exam results available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData && attendanceData.length > 0 ? (
                <div className="space-y-2">
                  {attendanceData.slice(0, 20).map((att: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <p className="text-sm">{new Date(att.attendance_date).toLocaleDateString()}</p>
                      <Badge variant={att.status === 'present' ? 'default' : att.status === 'absent' ? 'destructive' : 'secondary'}>
                        {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">No attendance records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
              <CardDescription>Scheduled exams for your class</CardDescription>
            </CardHeader>
            <CardContent>
              {examsData && examsData.length > 0 ? (
                <div className="space-y-4">
                  {examsData.map((exam: any) => (
                    <div key={exam.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{exam.name}</p>
                          <p className="text-sm text-gray-600">{exam.classes?.name}</p>
                        </div>
                        <Badge>{exam.exam_type.toUpperCase()}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </div>
                        <div>Max Marks: <span className="font-medium">{exam.max_marks}</span></div>
                        <div>Pass: <span className="font-medium">{exam.passing_marks}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">No upcoming exams scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
