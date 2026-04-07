'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { calculateGPA, getGradeColor, getPassStatus } from '@/lib/grading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StudentResultsTabProps {
  studentId: string
}

export default function StudentResultsTab({ studentId }: StudentResultsTabProps) {
  const [results, setResults] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [gpa, setGpa] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const supabase = createClient()

        // Fetch student data to get school_id
        const { data: student } = await supabase
          .from('students')
          .select('school_id, class_id')
          .eq('id', studentId)
          .single()

        if (!student) return

        // Fetch marks
        const { data: marksData } = await supabase
          .from('marks')
          .select(
            `
          *,
          subjects(name, code),
          exams(name, exam_type, exam_date, max_marks)
        `
          )
          .eq('student_id', studentId)
          .eq('school_id', student.school_id)
          .order('exams(exam_date)', { ascending: false })

        setResults(marksData || [])

        // Get unique exams
        const uniqueExams = Array.from(
          new Map(
            marksData?.map((mark) => [mark.exam_id, mark.exams]) || []
          ).values()
        )
        setExams(uniqueExams)

        // Calculate GPA
        if (marksData && marksData.length > 0) {
          const allMarks = marksData.map((m) => m.marks_obtained)
          const maxMarks = marksData[0].exams?.max_marks || 100
          const gpaValue = calculateGPA(allMarks, {
            maxMarks,
            passingMarks: 40,
          })
          setGpa(gpaValue)
        }
      } catch (error) {
        console.error('Error fetching results:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [studentId])

  if (isLoading) {
    return <div className="text-center py-8">Loading results...</div>
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No exam results available yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* GPA Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">GPA</p>
              <p className="text-2xl font-bold">{gpa.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold">{exams.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold">
                {Array.from(new Set(results.map((r) => r.subject_id))).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold">
                {results.length > 0
                  ? Math.round((results.filter((r) => r.is_passed).length / results.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by Exam */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          {exams.slice(0, 3).map((exam) => (
            <TabsTrigger key={exam.id} value={exam.id} className="text-xs">
              {exam.name.substring(0, 10)}...
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Exam Results</CardTitle>
              <CardDescription>Complete history of marks and grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Exam</th>
                      <th className="text-left py-3 px-4 font-semibold">Subject</th>
                      <th className="text-center py-3 px-4 font-semibold">Marks</th>
                      <th className="text-center py-3 px-4 font-semibold">Grade</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => {
                      const passStatus = getPassStatus(result.is_passed)
                      return (
                        <tr key={result.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{result.exams?.name}</td>
                          <td className="py-3 px-4">{result.subjects?.name}</td>
                          <td className="text-center py-3 px-4 font-medium">
                            {result.marks_obtained}/{result.exams?.max_marks}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className={passStatus.color}>{passStatus.text}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {exams.map((exam) => {
          const examResults = results.filter((r) => r.exam_id === exam.id)
          return (
            <TabsContent key={exam.id} value={exam.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{exam.name}</CardTitle>
                  <CardDescription>
                    {new Date(exam.exam_date).toLocaleDateString()} • {exam.exam_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <p className="font-medium">{result.subjects?.name}</p>
                          <p className="text-sm text-gray-600">{result.subjects?.code}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">{result.marks_obtained}/{exam.max_marks}</p>
                            <p className="text-sm text-gray-600">
                              {Math.round((result.marks_obtained / exam.max_marks) * 100)}%
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                            <Badge className={getPassStatus(result.is_passed).color}>
                              {getPassStatus(result.is_passed).text}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

export { StudentResultsTab }
