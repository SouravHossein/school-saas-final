'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentFormProps {
  studentFeeId: string
  dueAmount: number
  amountPaid: number
  onPaymentSuccess?: () => void
}

export default function PaymentForm({
  studentFeeId,
  dueAmount,
  amountPaid,
  onPaymentSuccess,
}: PaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const remainingAmount = dueAmount - amountPaid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const paymentAmount = parseFloat(amount)

    if (!amount || paymentAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (paymentAmount > remainingAmount) {
      setError(`Payment exceeds remaining amount of $${remainingAmount.toFixed(2)}`)
      return
    }

    try {
      setLoading(true)

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

      // Get student fee details
      const { data: studentFee } = await supabase
        .from('student_fees')
        .select('student_id, amount')
        .eq('id', studentFeeId)
        .single()

      if (!studentFee) throw new Error('Student fee not found')

      // Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            school_id: profile.school_id,
            student_fee_id: studentFeeId,
            student_id: studentFee.student_id,
            amount: paymentAmount,
            payment_date: paymentDate,
            payment_method: paymentMethod,
            transaction_id: transactionId || null,
            notes: notes || null,
          },
        ])
        .select()
        .single()

      if (paymentError) throw paymentError

      // Update student_fees status and amount_paid
      const newAmountPaid = amountPaid + paymentAmount
      const newStatus =
        newAmountPaid >= dueAmount
          ? 'paid'
          : newAmountPaid > 0
            ? 'partial'
            : 'unpaid'

      const { error: updateError } = await supabase
        .from('student_fees')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
        })
        .eq('id', studentFeeId)

      if (updateError) throw updateError

      setSuccess(true)
      setAmount('')
      setTransactionId('')
      setNotes('')
      onPaymentSuccess?.()

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment recorded successfully
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg bg-muted p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-lg font-semibold">${dueAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold">${amountPaid.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold text-orange-600">
                  ${remainingAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max: $${remainingAmount.toFixed(2)}`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Reference number (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional payment notes or remarks"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recording Payment...' : 'Record Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
