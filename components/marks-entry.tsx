'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { calculateGrade, getGradeColor } from '@/lib/grading'
import { AlertCircle, Check } from 'lucide-react'

interface MarksEntryProps {
  examId: string
  schoolId: string
}

export default function MarksEntry({ examId, schoolId }: MarksEntryProps) {
  const [exam, setExam] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [students, setStudents] = useState<any[]>([])
  const [marks, setMarks] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch exam details
        const { data: examData } = await supabase
          .from('exams')
          .select('*')
          .eq('id', examId)
          .eq('school_id', schoolId)
          .single()

        setExam(examData)

        // Fetch all subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .order('name')

        setSubjects(subjectsData || [])
        if (subjectsData && subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0].id)
        }

        // Fetch students in the class
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, first_name, last_name, roll_number')
          .eq('school_id', schoolId)
          .eq('class_id', examData?.class_id)
          .order('roll_number')

        setStudents(studentsData || [])

        // Fetch existing marks
        if (selectedSubject && examData) {
          const { data: marksData } = await supabase
            .from('marks')
            .select('student_id, marks_obtained')
            .eq('exam_id', examData.id)
            .eq('subject_id', selectedSubject)

          const marksMap: { [key: string]: number } = {}
          marksData?.forEach((mark) => {
            marksMap[mark.student_id] = mark.marks_obtained
          })
          setMarks(marksMap)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [examId, schoolId])

  useEffect(() => {
    const fetchMarksForSubject = async () => {
      if (!selectedSubject || !exam) return

      try {
        const supabase = createClient()
        const { data: marksData } = await supabase
          .from('marks')
          .select('student_id, marks_obtained')
          .eq('exam_id', exam.id)
          .eq('subject_id', selectedSubject)

        const marksMap: { [key: string]: number } = {}
        marksData?.forEach((mark) => {
          marksMap[mark.student_id] = mark.marks_obtained
        })
        setMarks(marksMap)
      } catch (error) {
        console.error('Error fetching marks:', error)
      }
    }

    fetchMarksForSubject()
  }, [selectedSubject, exam])

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = value === '' ? 0 : Math.min(parseInt(value) || 0, exam?.max_marks || 100)
    setMarks({ ...marks, [studentId]: numValue })
  }

  const handleSaveMarks = async () => {
    if (!selectedSubject || !exam) return

    setSaving(true)
    setSuccessMessage('')

    try {
      const supabase = createClient()

      // Prepare upsert data
      const marksToSave = students.map((student) => ({
        student_id: student.id,
        exam_id: exam.id,
        subject_id: selectedSubject,
        school_id: schoolId,
        marks_obtained: marks[student.id] || 0,
        ...calculateGrade(marks[student.id] || 0, { maxMarks: exam.max_marks, passingMarks: exam.passing_marks }),
      }))

      const { error } = await supabase.from('marks').upsert(marksToSave, {
        onConflict: 'student_id,exam_id,subject_id',
      })

      if (error) throw error

      setSuccessMessage(`Marks saved for ${selectedSubject} successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving marks:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!exam) {
    return <div className="text-center py-8 text-red-600">Exam not found</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mark Entry</CardTitle>
          <CardDescription>{exam.name} - Maximum Marks: {exam.max_marks}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-3">
            <label className="font-semibold">Select Subject *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`p-3 rounded border text-sm font-medium transition ${
                    selectedSubject === subject.id
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700">
              <Check className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold">Roll No</th>
                  <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                  <th className="text-center py-3 px-4 font-semibold">Marks ({exam.max_marks})</th>
                  <th className="text-center py-3 px-4 font-semibold">Grade</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentMarks = marks[student.id] || 0
                  const gradeResult = calculateGrade(studentMarks, {
                    maxMarks: exam.max_marks,
                    passingMarks: exam.passing_marks,
                  })

                  return (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{student.roll_number}</td>
                      <td className="py-3 px-4">{`${student.first_name} ${student.last_name}`}</td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          max={exam.max_marks}
                          value={studentMarks}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-20 text-center"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getGradeColor(gradeResult.grade)}>
                          {gradeResult.grade}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {gradeResult.isPassed ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Pass
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-700">
                            Fail
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-8 text-gray-500">No students in this class</div>
            )}
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSaveMarks} disabled={saving || !selectedSubject}>
              {saving ? 'Saving...' : 'Save Marks for All Students'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
