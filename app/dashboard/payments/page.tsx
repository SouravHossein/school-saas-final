'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default async function PaymentsPage() {
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

  const { data: payments } = await supabase
    .from('payments')
    .select(
      `
      id,
      amount,
      payment_status,
      payment_gateway,
      payment_date,
      transaction_reference,
      student_fees (
        id,
        students (
          id,
          full_name,
          roll_number
        ),
        fee_structures (
          name
        )
      )
    `
    )
    .eq('student_fees.students.school_id', profile.school_id)
    .order('payment_date', { ascending: false })
    .limit(50)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGatewayIcon = (gateway: string) => {
    const icons: Record<string, string> = {
      bkash: '🏦',
      nagad: '💳',
      sslcommerz: '🛒',
      stripe: '💰',
      manual: '📝',
    }
    return icons[gateway] || '💳'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage all student fee payments</p>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{payments?.reduce((sum, p) => (p.payment_status === 'success' ? sum + p.amount : sum), 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments?.filter((p) => p.payment_status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments?.filter((p) => p.payment_status === 'failed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments
                ? Math.round(
                    (payments.filter((p) => p.payment_status === 'success').length / payments.length) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Of all transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Student</th>
                  <th className="text-left py-3 px-4 font-semibold">Fee Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Gateway</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments && payments.length > 0 ? (
                  payments.map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{payment.student_fees?.students?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            #{payment.student_fees?.students?.roll_number}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{payment.student_fees?.fee_structures?.name}</td>
                      <td className="py-3 px-4 font-medium">৳{payment.amount}</td>
                      <td className="py-3 px-4">
                        <span className="text-lg">{getGatewayIcon(payment.payment_gateway)}</span>
                        <span className="text-xs capitalize">{payment.payment_gateway}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`capitalize ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : 'Pending'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                      No payments recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
