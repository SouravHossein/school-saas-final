'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStructures() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user?.id)
        .single()

      const { data } = await supabase
        .from('salary_structures')
        .select('*')
        .eq('school_id', profile?.school_id)
        .order('created_at', { ascending: false })

      setStructures(data || [])
      setLoading(false)
    }

    fetchStructures()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Structures</h1>
          <p className="text-muted-foreground">Manage salary structures and components</p>
        </div>
        <Link href="/dashboard/hr/salary-structures/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Structure
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Structures List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading structures...</p>
          ) : structures.length === 0 ? (
            <p className="text-muted-foreground">No salary structures found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((structure) => (
                  <TableRow key={structure.id}>
                    <TableCell className="font-medium">{structure.name}</TableCell>
                    <TableCell>${structure.base_salary?.toFixed(2)}</TableCell>
                    <TableCell>{structure.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${structure.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {structure.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Link href={`/dashboard/hr/salary-structures/${structure.id}/edit`}>
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
