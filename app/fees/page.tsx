'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Edit2, Trash2, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface FeeStructure {
  id: string
  name: string
  description: string | null
  amount: number
  frequency: string
  due_date: number | null
  is_active: boolean
}

export default function FeesPage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadFeeStructures()
  }, [])

  const loadFeeStructures = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('fee_structures')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setFeeStructures(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee structures')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)
      const { error: deleteError } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', deleteId)

      if (deleteError) throw deleteError

      setFeeStructures((prev) => prev.filter((f) => f.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fee structure')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fee Structures</h1>
          <p className="text-muted-foreground">Manage school fee structures and types</p>
        </div>
        <Link href="/fees/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Fee Structure
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>
            All fee types configured for your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : feeStructures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No fee structures created yet
              </p>
              <Link href="/fees/new">
                <Button variant="outline">Create First Fee Structure</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{fee.name}</p>
                          {fee.description && (
                            <p className="text-sm text-muted-foreground">
                              {fee.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${fee.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {fee.frequency}
                      </TableCell>
                      <TableCell>
                        {fee.due_date ? `Day ${fee.due_date}` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fee.is_active ? 'default' : 'secondary'}>
                          {fee.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/fees/${fee.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(fee.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone. Students with assigned fees of this type will still retain their fee records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
