'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react'

export default async function FinanceAnalyticsPage() {
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

  // Get financial summary
  const { data: studentFeesData } = await supabase
    .from('student_fees')
    .select('amount, amount_paid, status')
    .eq('school_id', profile.school_id)

  const { data: paymentsData } = await supabase
    .from('payments')
    .select('amount, payment_status, created_at')
    .eq('school_id', profile.school_id)

  const totalDue = studentFeesData?.reduce((sum, fee) => sum + fee.amount, 0) || 0
  const totalCollected = studentFeesData?.reduce((sum, fee) => sum + fee.amount_paid, 0) || 0
  const totalPending = totalDue - totalCollected
  const collectionRate = totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(2) : 0

  const studentsWithDues = studentFeesData?.filter((f) => f.amount > f.amount_paid).length || 0
  const studentsFullyPaid = studentFeesData?.filter((f) => f.status === 'paid').length || 0
  const successfulPayments = paymentsData?.filter((p) => p.payment_status === 'success').length || 0

  // Monthly revenue trend (simplified)
  const monthlyRevenue: Record<string, number> = {}
  paymentsData?.forEach((payment: any) => {
    if (payment.payment_status === 'success' && payment.created_at) {
      const month = new Date(payment.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
        <p className="text-muted-foreground mt-2">Comprehensive financial insights for your school</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalDue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">From all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">৳{totalCollected.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Target className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">৳{totalPending.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground">Of total dues</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fully Paid Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsFullyPaid}</div>
            <p className="text-xs text-muted-foreground text-green-600">All fees paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">With Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{studentsWithDues}</div>
            <p className="text-xs text-muted-foreground">Need to follow up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulPayments}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Collection Trend</CardTitle>
          <CardDescription>Revenue collected each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(monthlyRevenue).length > 0 ? (
              Object.entries(monthlyRevenue)
                .sort()
                .map(([month, amount]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-blue-200 rounded" style={{ width: Math.min(200, amount / 100) }} />
                      <span className="text-sm font-medium">৳{amount.toFixed(0)}</span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">No payment data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Average Fee Amount</p>
            <p className="text-2xl font-bold">
              ৳{studentFeesData && studentFeesData.length > 0 ? (totalDue / studentFeesData.length).toFixed(0) : 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Amount Paid</p>
            <p className="text-2xl font-bold">
              ৳{studentFeesData && studentFeesData.length > 0 ? (totalCollected / studentFeesData.length).toFixed(0) : 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Outstanding Ratio</p>
            <p className="text-2xl font-bold">
              {studentFeesData && studentFeesData.length > 0
                ? ((studentsWithDues / studentFeesData.length) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Fees Assigned</p>
            <p className="text-2xl font-bold">{studentFeesData?.length || 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
