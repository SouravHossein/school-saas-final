import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, BookOpen, BarChart3, User, Calendar, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile with school info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, schools(*)')
    .eq('id', user.id)
    .single()

  // Get stats for the dashboard
  const { data: classesData } = await supabase
    .from('classes')
    .select('id')
    .eq('school_id', profile?.school_id)

  const { data: sectionsData } = await supabase
    .from('sections')
    .select('id')
    .eq('school_id', profile?.school_id)

  const { data: studentsData } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', profile?.school_id)

  // Get today's attendance stats
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('school_id', profile?.school_id)
    .eq('attendance_date', today)

  // Get financial stats
  const { data: studentFeesData } = await supabase
    .from('student_fees')
    .select('amount, amount_paid, status')
    .eq('school_id', profile?.school_id)

  const classCount = classesData?.length || 0
  const sectionCount = sectionsData?.length || 0
  const studentCount = studentsData?.length || 0
  const presentToday = todayAttendance?.filter((a) => a.status === 'present').length || 0
  const absentToday = todayAttendance?.filter((a) => a.status === 'absent').length || 0
  
  const totalDue = studentFeesData?.reduce((sum, fee) => sum + fee.amount, 0) || 0
  const totalCollected = studentFeesData?.reduce((sum, fee) => sum + fee.amount_paid, 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          {profile?.schools?.name || 'Your School'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Classes"
          value={classCount}
          description="Total classes in your school"
          icon={<BookOpen className="w-8 h-8" />}
        />
        <StatsCard
          title="Sections"
          value={sectionCount}
          description="Total sections configured"
          icon={<Users className="w-8 h-8" />}
        />
        <StatsCard
          title="Students"
          value={studentCount}
          description="Total students enrolled"
          icon={<User className="w-8 h-8" />}
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          description="Students present today"
          icon={<Calendar className="w-8 h-8 text-green-600" />}
        />
        <StatsCard
          title="Absent Today"
          value={absentToday}
          description="Students absent today"
          icon={<Calendar className="w-8 h-8 text-red-600" />}
        />
        <StatsCard
          title="Collected"
          value={`$${totalCollected.toFixed(0)}`}
          description="Total fees collected"
          icon={<DollarSign className="w-8 h-8 text-green-600" />}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/classes/new">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Add New Class
              </Button>
            </Link>
            <Link href="/sections/new">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Add New Section
              </Button>
            </Link>
            <Link href="/students/new">
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Add New Student
              </Button>
            </Link>
            <Link href="/dashboard/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </Link>
            <Link href="/fees/assign">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Assign Fees
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* School Info */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">School Name:</span>
            <span className="font-medium">{profile?.schools?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subdomain:</span>
            <span className="font-medium">{profile?.schools?.subdomain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Role:</span>
            <span className="font-medium capitalize">{profile?.role}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary opacity-75">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
