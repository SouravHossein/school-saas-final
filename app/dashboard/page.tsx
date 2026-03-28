import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, BookOpen, BarChart3, User, Calendar, DollarSign, Megaphone, MessageCircle } from 'lucide-react'

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

  // Get announcements
  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('id, title, priority')
    .eq('school_id', profile?.school_id)
    .order('published_at', { ascending: false })
    .limit(3)

  // Get unread notifications
  const { data: notificationsData } = await supabase
    .from('notifications')
    .select('id')
    .eq('recipient_id', user.id)
    .eq('is_read', false)

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

      {/* Quick Actions - Role Based */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            {profile?.role === 'school_admin'
              ? 'Manage your school'
              : profile?.role === 'teacher'
                ? 'Manage classes and students'
                : 'View student information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin-only actions */}
            {(profile?.role === 'school_admin' || profile?.role === 'super_admin') && (
              <>
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
                <Link href="/fees/assign">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Assign Fees
                  </Button>
                </Link>
                <Link href="/announcements/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Megaphone className="w-4 h-4 mr-2" />
                    New Announcement
                  </Button>
                </Link>
              </>
            )}

            {/* Available to all roles */}
            <Link href="/dashboard/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </Link>
            <Link href="/messages/new">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Latest Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Latest Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcementsData && announcementsData.length > 0 ? (
            <div className="space-y-3">
              {announcementsData.map((announcement: any) => (
                <div key={announcement.id} className="text-sm p-2 bg-muted rounded">
                  <p className="font-medium">{announcement.title}</p>
                </div>
              ))}
              <Link href="/announcements">
                <Button variant="link" className="w-full justify-start">
                  View All Announcements
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No announcements yet</p>
          )}
        </CardContent>
      </Card>

      {/* Communication Status */}
      {notificationsData && notificationsData.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm">
              You have <strong>{notificationsData.length}</strong> unread notifications
            </p>
            <Link href="/notifications" className="inline-block mt-2">
              <Button size="sm">View All</Button>
            </Link>
          </CardContent>
        </Card>
      )}
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
