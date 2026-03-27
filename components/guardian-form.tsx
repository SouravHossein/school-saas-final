'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

interface GuardianFormProps {
  studentId: string
  schoolId: string
  onSave?: () => void
}

interface Guardian {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  relationship: string
  occupation: string
  address: string
}

export default function GuardianForm({
  studentId,
  schoolId,
  onSave,
}: GuardianFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    relationship: '',
    occupation: '',
    address: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .insert({
          ...formData,
          school_id: schoolId,
        })
        .select('id')
        .single()

      if (guardianError) throw guardianError

      // Link guardian to student
      const { error: linkError } = await supabase
        .from('student_guardians')
        .insert({
          student_id: studentId,
          guardian_id: guardianData.id,
          is_primary: guardians.length === 0,
        })

      if (linkError) throw linkError

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        relationship: '',
        occupation: '',
        address: '',
      })
      setShowForm(false)
      if (onSave) onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guardians</CardTitle>
        <CardDescription>Manage student guardians and contacts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Input
                    id="relationship"
                    name="relationship"
                    placeholder="e.g., Father, Mother, Guardian"
                    required
                    value={formData.relationship}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Guardian'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setShowForm(true)} variant="outline">
              Add Guardian
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
