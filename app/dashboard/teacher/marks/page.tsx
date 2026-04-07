'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MarkRecord {
  id: string
  studentId: string
  studentName: string
  rollNumber: string
  marksObtained: number | null
  grade: string | null
}

export default function MarksPage() {
  const router = useRouter()
  const supabase = createClient()
  const [marks, setMarks] = useState<MarkRecord[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [sectionId, setSectionId] = useState<string>('')
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (!profile?.school_id) return

        // Get sections
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id, name, class_id')
          .eq('school_id', profile.school_id)

        setSections(sectionsData || [])
        if (sectionsData && sectionsData.length > 0) {
          setSectionId(sectionsData[0].id)
        }

        // Get subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name, code')
          .eq('school_id', profile.school_id)
          .eq('is_active', true)

        setSubjects(subjectsData || [])

        // Get exams
        const { data: examsData } = await supabase
          .from('exams')
          .select('id, name, exam_type, max_marks')
          .eq('school_id', profile.school_id)
          .eq('is_published', true)

        setExams(examsData || [])
        if (examsData && examsData.length > 0) {
          setSelectedExam(examsData[0].id)
        }
      } catch (error) {
        console.error('[v0] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedExam || !selectedSubject || !sectionId) return

    const fetchMarks = async () => {
      try {
        // Get students in section
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, first_name, last_name, roll_number')
          .eq('section_id', sectionId)
          .eq('status', 'active')

        // Get marks records
        const { data: marksData } = await supabase
          .from('marks')
          .select('*')
          .eq('exam_id', selectedExam)
          .eq('subject_id', selectedSubject)

        const marksMap = new Map(marksData?.map((m) => [m.student_id, m]) || [])

        const markRecords: MarkRecord[] = (studentsData || []).map((student) => {
          const record = marksMap.get(student.id)
          return {
            id: record?.id || '',
            studentId: student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            rollNumber: student.roll_number || 'N/A',
            marksObtained: record?.marks_obtained || null,
            grade: record?.grade || null,
          }
        })

        setMarks(markRecords)
      } catch (error) {
        console.error('[v0] Error fetching marks:', error)
      }
    }

    fetchMarks()
  }, [selectedExam, selectedSubject, sectionId])

  const handleMarksChange = (studentId: string, value: string) => {
    setMarks((prev) =>
      prev.map((record) =>
        record.studentId === studentId
          ? { ...record, marksObtained: value ? parseInt(value) : null }
          : record
      )
    )
  }

  const calculateGrade = (marks: number | null, maxMarks: number) => {
    if (!marks) return null
    const percentage = (marks / maxMarks) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    return 'F'
  }

  const handleSaveMarks = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !selectedExam) return

      const exam = exams.find((e) => e.id === selectedExam)
      if (!exam) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

      for (const record of marks) {
        if (record.marksObtained !== null) {
          const grade = calculateGrade(record.marksObtained, exam.max_marks)
          const isPassed = record.marksObtained >= (exam.passing_marks || 0)

          if (record.id) {
            // Update existing
            await supabase
              .from('marks')
              .update({
                marks_obtained: record.marksObtained,
                grade,
                is_passed: isPassed,
              })
              .eq('id', record.id)
          } else {
            // Insert new
            await supabase.from('marks').insert({
              school_id: profile?.school_id,
              student_id: record.studentId,
              exam_id: selectedExam,
              subject_id: selectedSubject,
              marks_obtained: record.marksObtained,
              grade,
              is_passed: isPassed,
            })
          }
        }
      }

      setSuccessMessage('Marks saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('[v0] Error saving marks:', error)
      alert('Failed to save marks. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const selectedExamData = exams.find((e) => e.id === selectedExam)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enter Marks</h1>
        <p className="text-muted-foreground">Record exam marks for students</p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Exam and Subject</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
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
            <Label>Exam</Label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {marks.length > 0 && selectedExamData && (
        <Card>
          <CardHeader>
            <CardTitle>Marks Entry</CardTitle>
            <CardDescription>
              Max Marks: {selectedExamData.max_marks} | Passing Marks:{' '}
              {selectedExamData.passing_marks || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((record) => (
                  <TableRow key={record.studentId}>
                    <TableCell>{record.rollNumber}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={selectedExamData?.max_marks || 100}
                        value={record.marksObtained ?? ''}
                        onChange={(e) => handleMarksChange(record.studentId, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {calculateGrade(record.marksObtained, selectedExamData?.max_marks || 100) ||
                          '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSaveMarks} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Marks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
