import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, BookOpen, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function ParentPortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get guardian/parent record
  const { data: guardianData } = await supabase
    .from('student_guardians')
    .select('student_id, relationship, students(*, sections(name, classes(name)))')
    .eq('guardian_id', user.id)

  if (!guardianData || guardianData.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Parent Portal</h1>
          <p className="text-muted-foreground mt-2">
            No students linked to your account
          </p>
        </div>
      </div>
    )
  }

  const children = guardianData.map(g => g.students)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Parent Portal</h1>
        <p className="text-muted-foreground mt-2">
          Managing {children.length} {children.length === 1 ? 'child' : 'children'}
        </p>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 gap-6">
        {children.map((student: any) => {
          const getAttendanceStats = async () => {
            const result = await supabase
              .from('attendance')
              .select('status')
              .eq('student_id', student.id)
              .order('attendance_date', { ascending: false })
              .limit(30)
            return result.data || []
          }

          return (
            <Card key={student.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {student.full_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {student.sections?.classes?.name} - {student.sections?.name}
                    </CardDescription>
                  </div>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Child Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="font-bold">View Details</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Exam Results</p>
                      <p className="font-bold">View Results</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fee Status</p>
                      <p className="font-bold">View Details</p>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{student.roll_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollment Date</p>
                    <p className="font-medium">
                      {student.enrollment_date 
                        ? new Date(student.enrollment_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for monitoring your children</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              View Attendance
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Check Grades
            </Button>
            <Link href="/messages/new" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Contact School
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
