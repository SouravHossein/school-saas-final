'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStaff() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user?.id)
        .single()

      const { data } = await supabase
        .from('staff')
        .select('*')
        .eq('school_id', profile?.school_id)
        .order('created_at', { ascending: false })

      setStaff(data || [])
      setLoading(false)
    }

    fetchStaff()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage school staff and employees</p>
        </div>
        <Link href="/dashboard/hr/staff/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Staff
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading staff...</p>
          ) : staff.length === 0 ? (
            <p className="text-muted-foreground">No staff members found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{`${member.first_name} ${member.last_name}`}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>{member.department || '-'}</TableCell>
                    <TableCell className="capitalize">{member.employment_type}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="flex gap-2">
                      <Link href={`/dashboard/hr/staff/${member.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
