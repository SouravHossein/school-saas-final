'use client'

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
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface ExamFormProps {
  initialData?: any
  schoolId: string
}

const examTypes = [
  { value: 'midterm', label: 'Mid-term' },
  { value: 'final', label: 'Final' },
  { value: 'semester', label: 'Semester' },
  { value: 'unit-test', label: 'Unit Test' },
  { value: 'other', label: 'Other' },
]

export default function ExamForm({ initialData, schoolId }: ExamFormProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [classId, setClassId] = useState(initialData?.class_id || '')
  const [examDate, setExamDate] = useState(initialData?.exam_date || '')
  const [examType, setExamType] = useState(initialData?.exam_type || 'midterm')
  const [maxMarks, setMaxMarks] = useState(initialData?.max_marks || '100')
  const [passingMarks, setPassingMarks] = useState(initialData?.passing_marks || '40')
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', schoolId)
          .order('name')

        setClasses(data || [])
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    if (schoolId) fetchClasses()
  }, [schoolId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!classId) throw new Error('Please select a class')

      const supabase = createClient()

      const examData = {
        name,
        description,
        class_id: classId,
        exam_date: examDate,
        exam_type: examType,
        max_marks: parseInt(maxMarks),
        passing_marks: parseInt(passingMarks),
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      }

      if (initialData) {
        const { error: updateError } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', initialData.id)
          .eq('school_id', schoolId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('exams').insert({
          school_id: schoolId,
          ...examData,
        })

        if (insertError) throw insertError
      }

      router.push('/dashboard/exams')
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
          <Label htmlFor="name">Exam Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Mathematics Final Exam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="class">Class *</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
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

          <div className="grid gap-2">
            <Label htmlFor="exam-type">Exam Type *</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="exam-date">Exam Date *</Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max-marks">Maximum Marks *</Label>
            <Input
              id="max-marks"
              type="number"
              min="1"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="passing-marks">Passing Marks *</Label>
            <Input
              id="passing-marks"
              type="number"
              min="0"
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Exam description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_published"
            checked={isPublished}
            onCheckedChange={(checked) => setIsPublished(checked as boolean)}
          />
          <Label htmlFor="is_published" className="font-normal cursor-pointer">
            Publish Results
          </Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Exam' : 'Create Exam'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
