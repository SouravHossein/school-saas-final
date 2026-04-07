'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Building2, Users, TrendingUp, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PlatformStats {
  totalSchools: number
  totalStudents: number
  totalStaff: number
  totalRevenue: number
  activeSchools: number
  monthlyGrowth: number
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<PlatformStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalRevenue: 0,
    activeSchools: 0,
    monthlyGrowth: 0,
  })
  const [recentSchools, setRecentSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get schools count
        const { data: schoolsData, count: schoolsCount } = await supabase
          .from('schools')
          .select('id', { count: 'exact' })

        // Get total students
        const { data: studentsData, count: studentsCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' })

        // Get total staff
        const { data: staffData, count: staffCount } = await supabase
          .from('staff')
          .select('id', { count: 'exact' })

        // Get total collected fees
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'success')

        const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        // Get recent schools
        const { data: recentSchoolsData } = await supabase
          .from('schools')
          .select('id, name, subdomain, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalSchools: schoolsCount || 0,
          totalStudents: studentsCount || 0,
          totalStaff: staffCount || 0,
          totalRevenue,
          activeSchools: schoolsCount || 0,
          monthlyGrowth: 12,
        })

        setRecentSchools(recentSchoolsData || [])
      } catch (error) {
        console.error('[v0] Error fetching platform stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatformStats()
  }, [])

  const adminActions = [
    {
      title: 'Manage Schools',
      description: 'Add, edit, and manage schools',
      icon: Building2,
      href: '/admin/schools',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: Users,
      href: '/admin/users',
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
    },
    {
      title: 'Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeSchools} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">From fee collections</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.href}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">{action.title}</CardTitle>
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

      {/* Recent Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Schools</CardTitle>
          <CardDescription>Latest schools added to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSchools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/schools/${school.id}`)}
              >
                <div className="flex items-center gap-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{school.subdomain}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">Active</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(school.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
