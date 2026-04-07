'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [schoolId, setSchoolId] = useState<string>('')

  useEffect(() => {
    const fetchPayrolls = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user?.id)
        .single()

      setSchoolId(profile?.school_id || '')

      const { data } = await supabase
        .from('payrolls')
        .select(`
          *,
          staff:staff_id (first_name, last_name, position)
        `)
        .eq('school_id', profile?.school_id)
        .eq('payroll_month', selectedMonth)
        .eq('payroll_year', selectedYear)
        .order('created_at', { ascending: false })

      setPayrolls(data || [])
      setLoading(false)
    }

    if (schoolId) fetchPayrolls()
  }, [selectedMonth, selectedYear, schoolId])

  const generatePayroll = async () => {
    const supabase = createClient()
    try {
      const { data: staffList } = await supabase
        .from('staff')
        .select('id')
        .eq('school_id', schoolId)
        .eq('is_active', true)

      for (const member of staffList || []) {
        const { data: existing } = await supabase
          .from('payrolls')
          .select('id')
          .eq('staff_id', member.id)
          .eq('payroll_month', selectedMonth)
          .eq('payroll_year', selectedYear)
          .single()

        if (!existing) {
          await supabase.from('payrolls').insert({
            school_id: schoolId,
            staff_id: member.id,
            payroll_month: selectedMonth,
            payroll_year: selectedYear,
            gross_salary: 0,
            net_salary: 0,
            payment_status: 'pending',
          })
        }
      }

      alert('Payroll generated successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error generating payroll:', error)
      alert('Failed to generate payroll')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process and manage staff payroll</p>
        </div>
        <Button onClick={generatePayroll}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Payroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading payroll...</p>
          ) : payrolls.length === 0 ? (
            <p className="text-muted-foreground">No payroll records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>{`${payroll.staff.first_name} ${payroll.staff.last_name}`}</TableCell>
                    <TableCell>{payroll.staff.position}</TableCell>
                    <TableCell>${payroll.gross_salary?.toFixed(2)}</TableCell>
                    <TableCell>${payroll.total_deductions?.toFixed(2)}</TableCell>
                    <TableCell className="font-bold">${payroll.net_salary?.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{payroll.payment_status}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/hr/payroll/${payroll.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
