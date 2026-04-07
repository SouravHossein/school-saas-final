'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

export default function PayslipPage({ params }: { params: { id: string } }) {
  const [payroll, setPayroll] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPayroll() {
      const supabase = createClient()

      const { data: payrollData } = await supabase
        .from('payrolls')
        .select(`
          *,
          staff:staff_id (id, first_name, last_name, position, email, phone, bank_account, bank_name)
        `)
        .eq('id', params.id)
        .single()

      setPayroll(payrollData)

      const { data: itemsData } = await supabase
        .from('payroll_items')
        .select('*')
        .eq('payroll_id', params.id)

      setItems(itemsData || [])
      setLoading(false)
    }

    fetchPayroll()
  }, [params.id])

  const earnings = items.filter(i => i.component_type === 'earning')
  const deductions = items.filter(i => i.component_type === 'deduction')

  if (loading) return <p>Loading payslip...</p>

  return (
    <div className="space-y-6">
      <Link href="/dashboard/hr/payroll">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Payroll
        </Button>
      </Link>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Payslip</CardTitle>
              <CardDescription>
                {payroll?.payroll_month}/{payroll?.payroll_year}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              Print/Download
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Employee Details */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-2">Employee Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{`${payroll?.staff?.first_name} ${payroll?.staff?.last_name}`}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Position</p>
                <p className="font-medium">{payroll?.staff?.position}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{payroll?.staff?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bank Account</p>
                <p className="font-medium">{payroll?.staff?.bank_account || '-'}</p>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-2">Earnings</h3>
            <table className="w-full text-sm">
              <tbody>
                {earnings.map((item) => (
                  <tr key={item.id} className="flex justify-between py-1">
                    <td>{item.component_name}</td>
                    <td className="font-medium">${item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>Total Earnings</span>
              <span>${earnings.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="border-b pb-4">
            <h3 className="font-bold mb-2">Deductions</h3>
            <table className="w-full text-sm">
              <tbody>
                {deductions.map((item) => (
                  <tr key={item.id} className="flex justify-between py-1">
                    <td>{item.component_name}</td>
                    <td className="font-medium">${item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>Total Deductions</span>
              <span>${deductions.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Gross Salary</p>
                <p className="font-bold text-lg">${payroll?.gross_salary?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Deductions</p>
                <p className="font-bold text-lg text-red-600">${payroll?.total_deductions?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Salary</p>
                <p className="font-bold text-lg text-green-600">${payroll?.net_salary?.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground capitalize">Payment Status: {payroll?.payment_status}</p>
              {payroll?.payment_date && (
                <p className="text-xs text-muted-foreground">Payment Date: {new Date(payroll.payment_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
