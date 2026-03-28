'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react'

export default async function AcademicsAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  // Get academic data
  const { data: marksData } = await supabase
    .from('marks')
    .select('marks, grade, status, exams(name, exam_date)')
    .eq('school_id', profile.school_id)

  const { data: examsData } = await supabase
    .from('exams')
    .select('id, name, pass_threshold')
    .eq('school_id', profile.school_id)

  const { data: studentsData } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', profile.school_id)

  // Calculate academic metrics
  const totalMarks = marksData || []
  const totalStudents = studentsData?.length || 0
  const totalExams = examsData?.length || 0

  const passCount = totalMarks.filter((m: any) => m.status === 'pass').length
  const failCount = totalMarks.filter((m: any) => m.status === 'fail').length
  const passRate = totalMarks.length > 0 ? ((passCount / totalMarks.length) * 100).toFixed(2) : 0
  const failRate = totalMarks.length > 0 ? ((failCount / totalMarks.length) * 100).toFixed(2) : 0

  // Grade distribution
  const gradeDistribution: Record<string, number> = {}
  totalMarks.forEach((mark: any) => {
    gradeDistribution[mark.grade] = (gradeDistribution[mark.grade] || 0) + 1
  })

  // Average marks by exam
  const examStats: Record<string, { total: number; count: number }> = {}
  totalMarks.forEach((mark: any) => {
    const examName = mark.exams?.name || 'Unknown'
    if (!examStats[examName]) {
      examStats[examName] = { total: 0, count: 0 }
    }
    examStats[examName].total += mark.marks
    examStats[examName].count += 1
  })

  // Top performers
  const marksWithStudent = await supabase
    .from('marks')
    .select('marks, students(full_name, roll_number)')
    .eq('school_id', profile.school_id)
    .order('marks', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Analytics</h1>
        <p className="text-muted-foreground mt-2">School-wide academic performance insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">Conducted exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passRate}%</div>
            <p className="text-xs text-muted-foreground">{passCount} students passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
            <Award className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMarks.length > 0 ? (totalMarks.reduce((sum: number, m: any) => sum + m.marks, 0) / totalMarks.length).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Pass/Fail Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pass/Fail Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pass ({passCount})</span>
                <span className="text-sm font-bold">{passRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${Math.min(100, parseFloat(passRate as string))}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fail ({failCount})</span>
                <span className="text-sm font-bold">{failRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${Math.min(100, parseFloat(failRate as string))}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(gradeDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{grade}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-blue-200 rounded" style={{ width: Math.min(150, count * 15) }} />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Best academic achievers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marksWithStudent.data && marksWithStudent.data.length > 0 ? (
              marksWithStudent.data.map((mark: any, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{mark.students?.full_name}</p>
                    <p className="text-xs text-muted-foreground">#{mark.students?.roll_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{mark.marks}</p>
                    <p className="text-xs text-muted-foreground">Marks</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No exam results yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Exam-wise Performance</CardTitle>
          <CardDescription>Average marks by examination</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(examStats).length > 0 ? (
            Object.entries(examStats).map(([exam, stats]) => {
              const average = (stats.total / stats.count).toFixed(1)
              return (
                <div key={exam}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{exam}</span>
                    <span className="text-sm font-bold">{average}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${Math.min(100, parseFloat(average) as number)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.count} students</p>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">No exam data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
