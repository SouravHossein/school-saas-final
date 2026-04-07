'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface FeeStructure {
  id: string
  name: string
  amount: number
  frequency: string
}

interface Section {
  id: string
  name: string
}

export default function BulkFeeAssignment() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [selectedFee, setSelectedFee] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const [{ data: feesData }, { data: sectionsData }] = await Promise.all([
        supabase
          .from('fee_structures')
          .select('id, name, amount, frequency')
          .eq('is_active', true),
        supabase.from('sections').select('id, name'),
      ])

      setFeeStructures(feesData || [])
      setSections(sectionsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedFee || !selectedSection) {
      setError('Please select both fee and section')
      return
    }

    try {
      setAssigning(true)
      setError(null)
      setSuccess(null)

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

      // Get students in selected section
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('section_id', selectedSection)

      if (studentsError) throw studentsError

      const fee = feeStructures.find((f) => f.id === selectedFee)
      if (!fee) throw new Error('Fee structure not found')

      // Bulk insert student fees with upsert to prevent duplicates
      const studentFees = students?.map((student) => ({
        school_id: profile.school_id,
        student_id: student.id,
        fee_structure_id: selectedFee,
        amount: fee.amount,
        due_date: dueDate || null,
        status: 'unpaid',
        amount_paid: 0,
      })) || []

      const { error: insertError } = await supabase
        .from('student_fees')
        .upsert(studentFees, {
          onConflict: 'student_id, fee_structure_id',
        })

      if (insertError) throw insertError

      const count = students?.length || 0
      setSuccess(
        `Successfully assigned "${fee.name}" to ${count} student${count !== 1 ? 's' : ''}`
      )
      setSelectedFee('')
      setSelectedSection('')
      setDueDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign fees')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Fees to Students</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Select Fee Structure *</Label>
            <Select value={selectedFee} onValueChange={setSelectedFee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a fee..." />
              </SelectTrigger>
              <SelectContent>
                {feeStructures.map((fee) => (
                  <SelectItem key={fee.id} value={fee.id}>
                    {fee.name} - ${fee.amount.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Section *</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a section..." />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleAssign}
          disabled={assigning || !selectedFee || !selectedSection}
          className="w-full"
        >
          {assigning ? 'Assigning...' : 'Assign Fees to Section'}
        </Button>

        {feeStructures.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active fee structures found. Create some first.
            </AlertDescription>
          </Alert>
        )}

        {sections.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No sections found. Create some first.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
