'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function ClassForm({
  schoolId,
  classId,
  initialData,
}: {
  schoolId: string
  classId?: string
  initialData?: {
    name: string
    grade: string
    teacher_name?: string
    capacity?: number
  }
}) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name || '')
  const [grade, setGrade] = useState(initialData?.grade || '')
  const [teacherName, setTeacherName] = useState(initialData?.teacher_name || '')
  const [capacity, setCapacity] = useState(initialData?.capacity?.toString() || '')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        name,
        grade,
        teacher_name: teacherName || null,
        capacity: capacity ? parseInt(capacity) : null,
        school_id: schoolId,
      }

      if (classId) {
        // Update
        const { error: updateError } = await supabase
          .from('classes')
          .update(data)
          .eq('id', classId)

        if (updateError) throw updateError
      } else {
        // Create
        const { error: createError } = await supabase
          .from('classes')
          .insert([data])

        if (createError) throw createError
      }

      router.push('/classes')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{classId ? 'Edit Class' : 'Create New Class'}</CardTitle>
        <CardDescription>
          {classId ? 'Update class details' : 'Add a new class to your school'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Class 10-A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Input
                id="grade"
                type="text"
                placeholder="e.g., Grade 10"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="teacher">Teacher Name</Label>
              <Input
                id="teacher"
                type="text"
                placeholder="e.g., John Smith"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="capacity">Class Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 45"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : classId ? 'Update Class' : 'Create Class'}
            </Button>
            <Link href="/classes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
