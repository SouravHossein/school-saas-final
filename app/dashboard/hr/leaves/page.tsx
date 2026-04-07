'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Plus, CheckCircle2, Clock } from 'lucide-react'

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaves() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user?.id)
        .single()

      const { data } = await supabase
        .from('leaves')
        .select(`
          *,
          staff:staff_id (first_name, last_name, position)
        `)
        .eq('school_id', profile?.school_id)
        .order('leave_date', { ascending: false })

      setLeaves(data || [])
      setLoading(false)
    }

    fetchLeaves()
  }, [])

  const approveLeave = async (leaveId: string) => {
    const supabase = createClient()
    try {
      await supabase
        .from('leaves')
        .update({ is_approved: true, approved_at: new Date().toISOString() })
        .eq('id', leaveId)

      setLeaves(leaves.map(l => l.id === leaveId ? { ...l, is_approved: true } : l))
      alert('Leave approved successfully')
    } catch (error) {
      console.error('Error approving leave:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Manage staff leave requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p className="text-muted-foreground">No leave requests found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Leave Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{`${leave.staff.first_name} ${leave.staff.last_name}`}</TableCell>
                    <TableCell className="capitalize">{leave.leave_type}</TableCell>
                    <TableCell>{new Date(leave.leave_date).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.reason || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {leave.is_approved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Approved</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-600">Pending</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!leave.is_approved && (
                        <Button size="sm" onClick={() => approveLeave(leave.id)}>
                          Approve
                        </Button>
                      )}
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
