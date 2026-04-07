import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Calendar,
  DollarSign,
  Megaphone,
  MessageCircle,
  User,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, schools(*)')
    .eq('id', user.id)
    .single()

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

  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('school_id', profile?.school_id)
    .eq('attendance_date', today)

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

  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('id, title, priority')
    .eq('school_id', profile?.school_id)
    .order('published_at', { ascending: false })
    .limit(3)

  const { data: notificationsData } = await supabase
    .from('notifications')
    .select('id')
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  const quickActions =
    profile?.role === 'school_admin' || profile?.role === 'super_admin'
      ? [
          { href: '/classes/new', label: 'Add New Class', icon: BookOpen },
          { href: '/sections/new', label: 'Add New Section', icon: Users },
          { href: '/students/new', label: 'Add New Student', icon: User },
          { href: '/fees/assign', label: 'Assign Fees', icon: DollarSign },
          { href: '/announcements/new', label: 'New Announcement', icon: Megaphone },
          { href: '/messages/new', label: 'New Message', icon: MessageCircle },
        ]
      : [
          { href: '/dashboard/attendance', label: 'Mark Attendance', icon: Calendar },
          { href: '/messages/new', label: 'New Message', icon: MessageCircle },
        ]

  return (
    <div className="space-y-8">
      <section className="hero-panel grid-pattern overflow-hidden rounded-[2rem] border border-white/55 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="border-primary/15 bg-white/72 text-primary">
              {profile?.role?.replace('_', ' ') || 'school user'}
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
                Welcome back to {profile?.schools?.name || 'your school'}.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Here&apos;s a quick look at today&apos;s activity, school health, and the actions your team can take next.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroMetric label="Fees collected" value={`$${totalCollected.toFixed(0)}`} />
            <HeroMetric label="Outstanding due" value={`$${Math.max(totalDue - totalCollected, 0).toFixed(0)}`} />
            <HeroMetric label="Unread notices" value={`${notificationsData?.length || 0}`} />
            <HeroMetric label="Present today" value={`${presentToday}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatsCard title="Classes" value={classCount} description="Academic groups available" icon={<BookOpen className="h-5 w-5" />} />
        <StatsCard title="Sections" value={sectionCount} description="Sections configured" icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Students" value={studentCount} description="Learners enrolled" icon={<User className="h-5 w-5" />} />
        <StatsCard title="Present" value={presentToday} description="Marked present today" icon={<Calendar className="h-5 w-5 text-secondary" />} />
        <StatsCard title="Absent" value={absentToday} description="Marked absent today" icon={<Calendar className="h-5 w-5 text-destructive" />} />
        <StatsCard title="Collected" value={`$${totalCollected.toFixed(0)}`} description="Total fee collection" icon={<DollarSign className="h-5 w-5 text-primary" />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.86fr]">
        <Card className="surface-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription className="text-base">
              Jump into the work your team handles most often.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Button
                  key={action.href}
                  asChild
                  variant="outline"
                  className="h-auto justify-start rounded-[1.25rem] px-4 py-4 text-left"
                >
                  <Link href={action.href}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{action.label}</span>
                  </Link>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              School Snapshot
            </CardTitle>
            <CardDescription className="text-base">
              High-level indicators your administrators can scan quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SnapshotRow label="Attendance health" value={`${presentToday} present / ${absentToday} absent`} />
            <SnapshotRow label="Student coverage" value={`${studentCount} total learners`} />
            <SnapshotRow label="Organizational setup" value={`${classCount} classes across ${sectionCount} sections`} />
            <SnapshotRow label="Collection progress" value={`$${totalCollected.toFixed(0)} received`} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Megaphone className="h-5 w-5 text-primary" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcementsData && announcementsData.length > 0 ? (
              <div className="space-y-3">
                {announcementsData.map((announcement: any) => (
                  <div
                    key={announcement.id}
                    className="rounded-[1.25rem] border border-white/55 bg-white/72 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{announcement.title}</p>
                      {announcement.priority && (
                        <Badge variant="outline" className="capitalize">
                          {announcement.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <Button asChild variant="ghost" className="mt-2 justify-start px-0 text-primary">
                  <Link href="/announcements">View all announcements</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Inbox Status</CardTitle>
            <CardDescription className="text-base">
              Communication visibility for your current account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] bg-slate-950 px-5 py-5 text-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.78)]">
              <p className="text-sm uppercase tracking-[0.22em] text-white/60">Unread notifications</p>
              <p className="mt-3 text-4xl font-semibold">{notificationsData?.length || 0}</p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/notifications">Open notifications</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/55 bg-white/76 px-5 py-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
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
    <Card className="surface-card gap-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-foreground">{value}</div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/55 bg-white/72 px-4 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
