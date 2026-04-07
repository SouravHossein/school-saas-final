'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Calendar, BookOpen, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface TeacherStats {
  classCount: number
  studentCount: number
  pendingAttendance: number
  pendingMarks: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<TeacherStats>({
    classCount: 0,
    studentCount: 0,
    pendingAttendance: 0,
    pendingMarks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeacherStats = async () => {
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

        // Get classes where teacher is assigned
        const { data: classesData } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', profile.school_id)

        // Get sections
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id')
          .eq('school_id', profile.school_id)

        // Get students in teacher's sections
        const { data: studentsData } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', profile.school_id)
          .in('section_id', sectionsData?.map((s) => s.id) || [])

        // Get pending attendance
        const today = new Date().toISOString().split('T')[0]
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('id')
          .eq('school_id', profile.school_id)
          .eq('attendance_date', today)
          .is('marked_by', null)

        // Get pending marks
        const { data: marksData } = await supabase
          .from('marks')
          .select('id')
          .eq('school_id', profile.school_id)
          .is('marks_obtained', null)

        setStats({
          classCount: classesData?.length || 0,
          studentCount: studentsData?.length || 0,
          pendingAttendance: attendanceData?.length || 0,
          pendingMarks: marksData?.length || 0,
        })
      } catch (error) {
        console.error('[v0] Error fetching teacher stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherStats()
  }, [])

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record attendance for today',
      icon: Calendar,
      href: '/dashboard/teacher/attendance',
      count: stats.pendingAttendance,
    },
    {
      title: 'Enter Marks',
      description: 'Record exam marks for students',
      icon: BookOpen,
      href: '/dashboard/teacher/marks',
      count: stats.pendingMarks,
    },
    {
      title: 'View Classes',
      description: 'Manage your classes and sections',
      icon: Users,
      href: '/dashboard/teacher/classes',
      count: stats.classCount,
    },
    {
      title: 'Analytics',
      description: 'View attendance and marks reports',
      icon: BarChart3,
      href: '/dashboard/teacher/analytics',
      count: 0,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage attendance, marks, and classes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAttendance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMarks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.href}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm">{action.title}</CardTitle>
                    </div>
                    {action.count > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{action.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
