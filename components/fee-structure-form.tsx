'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FeeStructureFormProps {
  feeStructureId?: string
}

export default function FeeStructureForm({ feeStructureId }: FeeStructureFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [dueDate, setDueDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(!!feeStructureId)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (feeStructureId) {
      loadFeeStructure()
    }
  }, [feeStructureId])

  const loadFeeStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('id', feeStructureId)
        .single()

      if (error) throw error

      setName(data.name)
      setDescription(data.description || '')
      setAmount(data.amount.toString())
      setFrequency(data.frequency)
      setDueDate(data.due_date ? data.due_date.toString() : '')
      setIsActive(data.is_active)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee structure')
    } finally {
      setIsLoadingInitial(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
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

      const feeData = {
        school_id: profile.school_id,
        name,
        description: description || null,
        amount: parseFloat(amount),
        frequency,
        due_date: dueDate ? parseInt(dueDate) : null,
        is_active: isActive,
      }

      if (feeStructureId) {
        const { error: updateError } = await supabase
          .from('fee_structures')
          .update(feeData)
          .eq('id', feeStructureId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('fee_structures')
          .insert([feeData])

        if (insertError) throw insertError
      }

      router.push('/fees')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingInitial) {
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
        <CardTitle>
          {feeStructureId ? 'Edit Fee Structure' : 'Create Fee Structure'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Fee Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tuition Fee, Sports Fee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="one-time">One-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Day of Month)</Label>
              <Input
                id="dueDate"
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description or notes"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="mb-0">
              This fee is active
            </Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : feeStructureId ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/fees')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
