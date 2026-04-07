'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, FileText, Calendar, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OfficeStats {
  totalStudents: number
  newAdmissions: number
  pendingDocuments: number
  upcomingEvents: number
}

export default function OfficeStaffDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<OfficeStats>({
    totalStudents: 0,
    newAdmissions: 0,
    pendingDocuments: 0,
    upcomingEvents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOfficeStats = async () => {
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

        // Get total students
        const { data: studentsData, count: studentCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', profile.school_id)

        // Get new admissions (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        const { data: newStudents, count: newCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', profile.school_id)
          .gte('enrollment_date', thirtyDaysAgo)

        // Get upcoming events
        const today = new Date().toISOString().split('T')[0]
        const { data: events, count: eventCount } = await supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('school_id', profile.school_id)
          .gte('event_date', today)

        setStats({
          totalStudents: studentCount || 0,
          newAdmissions: newCount || 0,
          pendingDocuments: 5,
          upcomingEvents: eventCount || 0,
        })
      } catch (error) {
        console.error('[v0] Error fetching office stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOfficeStats()
  }, [])

  const quickActions = [
    {
      title: 'New Admission',
      description: 'Add new student admission',
      icon: Plus,
      href: '/dashboard/office/admissions/new',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Student Records',
      description: 'View and manage student records',
      icon: FileText,
      href: '/dashboard/office/records',
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Documents',
      description: 'Manage admission documents',
      icon: FileText,
      href: '/dashboard/office/documents',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      title: 'Events Calendar',
      description: 'View school events and calendar',
      icon: Calendar,
      href: '/dashboard/office/calendar',
      color: 'bg-purple-100 text-purple-800',
    },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Office Staff Dashboard</h1>
        <p className="text-muted-foreground">Manage admissions, records, and documents</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.newAdmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting submission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">School events</p>
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
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">{action.title}</CardTitle>
                    </div>
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

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest admissions and records updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium text-sm">New student admitted</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-medium text-sm">Documents verified</p>
              <p className="text-xs text-muted-foreground">5 hours ago</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="font-medium text-sm">Pending document reminder sent</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
