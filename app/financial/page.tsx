'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FinancialStats {
  totalCollected: number
  totalDue: number
  totalPending: number
  studentsWithFees: number
  studentsWithDues: number
  collectionPercentage: number
}

interface RecentPayment {
  id: string
  student_id: string
  students: { full_name: string }
  amount: number
  payment_date: string
  payment_method: string
}

export default function FinancialPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (!profile?.school_id) throw new Error('School ID not found')

      // Get all student fees
      const { data: studentFees } = await supabase
        .from('student_fees')
        .select('amount, amount_paid, status')
        .eq('school_id', profile.school_id)

      // Get recent payments
      const { data: payments } = await supabase
        .from('payments')
        .select('id, student_id, students(full_name), amount, payment_date, payment_method')
        .eq('school_id', profile.school_id)
        .order('payment_date', { ascending: false })
        .limit(10)

      // Calculate stats
      const totalDue = studentFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0
      const totalCollected = studentFees?.reduce((sum, fee) => sum + fee.amount_paid, 0) || 0
      const totalPending = totalDue - totalCollected
      const studentsWithFees = studentFees?.length || 0
      const studentsWithDues = studentFees?.filter((f) => f.status !== 'paid').length || 0
      const collectionPercentage =
        totalDue > 0 ? (totalCollected / totalDue) * 100 : 0

      setStats({
        totalCollected,
        totalDue,
        totalPending,
        studentsWithFees,
        studentsWithDues,
        collectionPercentage,
      })
      setRecentPayments(payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">School fees and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Link href="/fees/assign">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Assign Fees
            </Button>
          </Link>
          <Link href="/fees">
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Fee Structures
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats?.totalCollected.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-3xl font-bold">
                  ${stats?.totalDue.toFixed(2)}
                </p>
              </div>
              <BarChart className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${stats?.totalPending.toFixed(2)}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-3xl font-bold">
                {stats?.collectionPercentage.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Students with Fees</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.studentsWithFees}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Dues</p>
              <p className="text-3xl font-bold text-red-600">
                {stats?.studentsWithDues}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payments recorded yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.students.full_name}
                      </TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">
                          {payment.payment_method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
