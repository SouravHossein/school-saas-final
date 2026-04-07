'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FeeRecord {
  id: string
  studentName: string
  rollNumber: string
  className: string
  totalAmount: number
  amountPaid: number
  amountDue: number
  status: 'paid' | 'pending' | 'partial'
  dueDate: string
}

export default function FeesManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fees, setFees] = useState<FeeRecord[]>([])
  const [filteredFees, setFilteredFees] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchFees = async () => {
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
          .select(
            `
            id, 
            amount, 
            amount_paid, 
            status,
            due_date,
            students:student_id (
              first_name, 
              last_name, 
              roll_number,
              sections:section_id (
                classes:class_id (
                  name
                )
              )
            )
          `
          )
          .eq('school_id', profile.school_id)

        const feeRecords: FeeRecord[] =
          studentFeesData?.map((fee: any) => ({
            id: fee.id,
            studentName: `${fee.students?.first_name} ${fee.students?.last_name}`,
            rollNumber: fee.students?.roll_number || 'N/A',
            className: fee.students?.sections?.classes?.name || 'N/A',
            totalAmount: fee.amount,
            amountPaid: fee.amount_paid || 0,
            amountDue: (fee.amount || 0) - (fee.amount_paid || 0),
            status: fee.status,
            dueDate: fee.due_date || 'N/A',
          })) || []

        setFees(feeRecords)
        setFilteredFees(feeRecords)
      } catch (error) {
        console.error('[v0] Error fetching fees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFees()
  }, [])

  useEffect(() => {
    let filtered = fees

    if (searchTerm) {
      filtered = filtered.filter(
        (fee) =>
          fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((fee) => fee.status === statusFilter)
    }

    setFilteredFees(filtered)
  }, [searchTerm, statusFilter, fees])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'partial':
        return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>
      case 'pending':
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalFees = filteredFees.reduce((sum, fee) => sum + fee.totalAmount, 0)
  const totalCollected = filteredFees.reduce((sum, fee) => sum + fee.amountPaid, 0)
  const totalDue = filteredFees.reduce((sum, fee) => sum + fee.amountDue, 0)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-muted-foreground">Track and manage student fee payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalDue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records ({filteredFees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length > 0 ? (
                  filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.studentName}</TableCell>
                      <TableCell>{fee.rollNumber}</TableCell>
                      <TableCell>{fee.className}</TableCell>
                      <TableCell>₹{fee.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-green-600">
                        ₹{fee.amountPaid.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-red-600">
                        ₹{fee.amountDue.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/dashboard/accountant/fees/${fee.id}/payment`)
                          }
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No fee records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
