'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import PaymentForm from './payment-form'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StudentFee {
  id: string
  fee_structures: {
    name: string
  }
  amount: number
  due_date: string | null
  status: 'paid' | 'unpaid' | 'partial'
  amount_paid: number
  created_at: string
}

interface StudentFeesTabProps {
  studentId: string
}

export function StudentFeesTab({ studentId }: StudentFeesTabProps) {
  const [fees, setFees] = useState<StudentFee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    loadFees()
  }, [studentId, refreshKey])

  const loadFees = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('student_fees')
        .select('*, fee_structures(name)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setFees(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fees')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const calculateStats = () => {
    const totalDue = fees.reduce((sum, fee) => sum + fee.amount, 0)
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amount_paid, 0)
    const totalPending = totalDue - totalPaid

    return { totalDue, totalPaid, totalPending }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading fees...</p>
        </CardContent>
      </Card>
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
      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-2xl font-bold">${stats.totalDue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalPaid.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p
                className={`text-2xl font-bold ${
                  stats.totalPending > 0 ? 'text-orange-600' : 'text-green-600'
                }`}
              >
                ${stats.totalPending.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees Table */}
      {fees.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No fees assigned</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">
                        {fee.fee_structures.name}
                      </TableCell>
                      <TableCell>${fee.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">
                        ${fee.amount_paid.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${(fee.amount - fee.amount_paid).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {fee.due_date
                          ? new Date(fee.due_date).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell>
                        {fee.status !== 'paid' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Pay
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  Record Payment - {fee.fee_structures.name}
                                </DialogTitle>
                              </DialogHeader>
                              <PaymentForm
                                studentFeeId={fee.id}
                                dueAmount={fee.amount}
                                amountPaid={fee.amount_paid}
                                onPaymentSuccess={() =>
                                  setRefreshKey((prev) => prev + 1)
                                }
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
