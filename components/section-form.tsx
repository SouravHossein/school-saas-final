'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface Class {
  id: string
  name: string
}

export function SectionForm({
  schoolId,
  sectionId,
  initialData,
}: {
  schoolId: string
  sectionId?: string
  initialData?: {
    name: string
    class_id: string
    student_count?: number
    room_number?: string
  }
}) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name || '')
  const [classId, setClassId] = useState(initialData?.class_id || '')
  const [studentCount, setStudentCount] = useState(
    initialData?.student_count?.toString() || ''
  )
  const [roomNumber, setRoomNumber] = useState(initialData?.room_number || '')
  const [classes, setClasses] = useState<Class[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name')

      setClasses(data || [])
    }

    fetchClasses()
  }, [schoolId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        name,
        class_id: classId,
        student_count: studentCount ? parseInt(studentCount) : null,
        room_number: roomNumber || null,
        school_id: schoolId,
      }

      if (sectionId) {
        // Update
        const { error: updateError } = await supabase
          .from('sections')
          .update(data)
          .eq('id', sectionId)

        if (updateError) throw updateError
      } else {
        // Create
        const { error: createError } = await supabase
          .from('sections')
          .insert([data])

        if (createError) throw createError
      }

      router.push('/sections')
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
        <CardTitle>{sectionId ? 'Edit Section' : 'Create New Section'}</CardTitle>
        <CardDescription>
          {sectionId ? 'Update section details' : 'Add a new section to your school'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Section Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Section A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="class">Class *</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="students">Number of Students</Label>
              <Input
                id="students"
                type="number"
                placeholder="e.g., 45"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="room">Room Number</Label>
              <Input
                id="room"
                type="text"
                placeholder="e.g., 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : sectionId ? 'Update Section' : 'Create Section'}
            </Button>
            <Link href="/sections">
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
