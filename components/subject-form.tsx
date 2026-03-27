'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface SubjectFormProps {
  initialData?: any
  schoolId: string
}

export default function SubjectForm({ initialData, schoolId }: SubjectFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [code, setCode] = useState(initialData?.code || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (initialData) {
        const { error: updateError } = await supabase
          .from('subjects')
          .update({
            name,
            code,
            description,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)
          .eq('school_id', schoolId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('subjects').insert({
          school_id: schoolId,
          name,
          code,
          description,
          is_active: isActive,
        })

        if (insertError) throw insertError
      }

      router.push('/dashboard/subjects')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Subject Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Mathematics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="code">Subject Code *</Label>
          <Input
            id="code"
            placeholder="e.g., MATH101"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Subject description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked as boolean)}
          />
          <Label htmlFor="is_active" className="font-normal cursor-pointer">
            Active
          </Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Subject' : 'Create Subject'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
