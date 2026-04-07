import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, BookOpen, DollarSign } from 'lucide-react'

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
      <div className="space-y-8">
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
    .select('status')
    .eq('student_id', student.id)
    .order('attendance_date', { ascending: false })
    .limit(30)

  // Get marks/results
  const { data: marksData } = await supabase
    .from('marks')
    .select('*, exams(name), subjects(name)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get fee information
  const { data: feeData } = await supabase
    .from('student_fees')
    .select('amount, amount_paid, status, fee_structures(name)')
    .eq('student_id', student.id)

  // Calculate statistics
  const totalAttendance = attendanceData?.length || 0
  const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0
  const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0

  const totalFeeDue = feeData?.reduce((sum, f) => sum + f.amount, 0) || 0
  const totalFeePaid = feeData?.reduce((sum, f) => sum + f.amount_paid, 0) || 0
  const totalFeePending = totalFeeDue - totalFeePaid

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {student.full_name}</h1>
        <p className="text-muted-foreground mt-2">
          {student.sections?.classes?.name} - {student.sections?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {presentDays} of {totalAttendance} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Exams Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marksData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total exam attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Fees Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFeePaid.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              of ${totalFeeDue.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{student.status}</div>
            <p className="text-xs text-muted-foreground">
              Current enrollment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exams */}
      {marksData && marksData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Exam Results</CardTitle>
            <CardDescription>Your latest exam scores and grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marksData.slice(0, 5).map((mark: any) => (
                <div key={mark.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{mark.exams?.name}</p>
                    <p className="text-sm text-muted-foreground">{mark.subjects?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{mark.marks}</p>
                    <Badge variant={mark.grade === 'A+' || mark.grade === 'A' ? 'default' : 'secondary'}>
                      {mark.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Status */}
      {feeData && feeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Status</CardTitle>
            <CardDescription>Your school fee information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeData.map((fee: any) => (
                <div key={fee.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{fee.fee_structures?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid: ${fee.amount_paid.toFixed(0)} / ${fee.amount.toFixed(0)}
                    </p>
                  </div>
                  <Badge variant={fee.status === 'paid' ? 'default' : fee.status === 'partial' ? 'secondary' : 'destructive'}>
                    {fee.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
