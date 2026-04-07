'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface FinancialStats {
  totalFees: number
  totalCollected: number
  totalPending: number
  totalPartial: number
  collectionRate: number
  paidCount: number
  pendingCount: number
  partialCount: number
}

export default function AccountantDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<FinancialStats>({
    totalFees: 0,
    totalCollected: 0,
    totalPending: 0,
    totalPartial: 0,
    collectionRate: 0,
    paidCount: 0,
    pendingCount: 0,
    partialCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialStats = async () => {
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

        const { data: studentFeesData } = await supabase
          .from('student_fees')
          .select('amount, amount_paid, status')
          .eq('school_id', profile.school_id)

        const fees = studentFeesData || []
        const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0)
        const totalCollected = fees.reduce((sum, fee) => sum + (fee.amount_paid || 0), 0)
        const totalPending =
          fees
            .filter((f) => f.status === 'pending')
            .reduce((sum, fee) => sum + (fee.amount - (fee.amount_paid || 0)), 0) || 0
        const totalPartial =
          fees
            .filter((f) => f.status === 'partial')
            .reduce((sum, fee) => sum + (fee.amount - (fee.amount_paid || 0)), 0) || 0
        const paidCount = fees.filter((f) => f.status === 'paid').length
        const pendingCount = fees.filter((f) => f.status === 'pending').length
        const partialCount = fees.filter((f) => f.status === 'partial').length

        setStats({
          totalFees,
          totalCollected,
          totalPending,
          totalPartial,
          collectionRate: totalFees > 0 ? (totalCollected / totalFees) * 100 : 0,
          paidCount,
          pendingCount,
          partialCount,
        })
      } catch (error) {
        console.error('[v0] Error fetching financial stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialStats()
  }, [])

  const quickActions = [
    {
      title: 'Manage Fees',
      description: 'View and manage student fees',
      icon: DollarSign,
      href: '/dashboard/accountant/fees',
    },
    {
      title: 'Payment Records',
      description: 'View payment transactions',
      icon: TrendingUp,
      href: '/dashboard/accountant/payments',
    },
    {
      title: 'Reports',
      description: 'Generate financial reports',
      icon: BarChart3,
      href: '/dashboard/accountant/reports',
    },
    {
      title: 'Reminders',
      description: 'Send payment reminders',
      icon: AlertCircle,
      href: '/dashboard/accountant/reminders',
    },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accountant Dashboard</h1>
        <p className="text-muted-foreground">Manage school finances and fee collections</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalFees.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">From all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.totalCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.collectionRate.toFixed(1)}% collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{stats.totalPending.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Partial Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{stats.totalPartial.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.partialCount} partial</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                <span className="text-sm text-muted-foreground">{stats.paidCount} students</span>
              </div>
              <span className="text-sm font-semibold">
                {stats.paidCount > 0
                  ? ((stats.paidCount / (stats.paidCount + stats.pendingCount + stats.partialCount)) *
                      100).toFixed(1)
                  : 0}
                %
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-100 text-orange-800">Partial</Badge>
                <span className="text-sm text-muted-foreground">{stats.partialCount} students</span>
              </div>
              <span className="text-sm font-semibold">
                {stats.partialCount > 0
                  ? ((stats.partialCount / (stats.paidCount + stats.pendingCount + stats.partialCount)) *
                      100).toFixed(1)
                  : 0}
                %
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-100 text-red-800">Pending</Badge>
                <span className="text-sm text-muted-foreground">{stats.pendingCount} students</span>
              </div>
              <span className="text-sm font-semibold">
                {stats.pendingCount > 0
                  ? ((stats.pendingCount / (stats.paidCount + stats.pendingCount + stats.partialCount)) *
                      100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
