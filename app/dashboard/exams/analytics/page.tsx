'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPerformanceStats, calculateClassAverage } from '@/lib/grading'
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react'

export default function ExamAnalyticsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profileData } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        setProfile(profileData)

        const { data: examsData } = await supabase
          .from('exams')
          .select('*, classes(name)')
          .eq('school_id', profileData?.school_id)
          .order('exam_date', { ascending: false })

        setExams(examsData || [])

        if (examsData && examsData.length > 0) {
          setSelectedExamId(examsData[0].id)
        }
      } catch (error) {
        console.error('Error fetching exams:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExams()
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedExamId || !profile) return

      try {
        const supabase = createClient()

        const exam = exams.find((e) => e.id === selectedExamId)
        setSelectedExam(exam)

        // Fetch all marks for this exam
        const { data: marksData } = await supabase
          .from('marks')
          .select('marks_obtained, is_passed')
          .eq('exam_id', selectedExamId)
          .eq('school_id', profile.school_id)

        const allMarks = marksData?.map((m) => m.marks_obtained) || []
        const stats = getPerformanceStats(allMarks, exam?.passing_marks || 40)
        const classAvg = calculateClassAverage(allMarks, exam?.max_marks || 100)

        setAnalytics({
          ...stats,
          classAverage: classAvg,
          maxMarks: exam?.max_marks || 100,
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    fetchAnalytics()
  }, [selectedExamId, exams, profile])

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam Analytics</h1>
        <p className="text-gray-600">View performance metrics for exams</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name} - {exam.classes?.name} ({new Date(exam.exam_date).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExam && analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                <p className="text-xs text-gray-600">In this exam</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.passedStudents}</div>
                <p className="text-xs text-gray-600">{analytics.passPercentage}% pass rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Class Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.classAverage}%</div>
                <p className="text-xs text-gray-600">Average percentage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analytics.topScore}/{analytics.maxMarks}</div>
                <p className="text-xs text-gray-600">Highest score</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>{selectedExam.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="text-lg font-medium">{selectedExam.classes?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exam Date</p>
                  <p className="text-lg font-medium">
                    {new Date(selectedExam.exam_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maximum Marks</p>
                  <p className="text-lg font-medium">{selectedExam.max_marks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passing Marks</p>
                  <p className="text-lg font-medium">{selectedExam.passing_marks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Passed</span>
                    <span className="text-sm font-bold">{analytics.passedStudents} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(analytics.passedStudents / analytics.totalStudents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Failed</span>
                    <span className="text-sm font-bold">{analytics.failedStudents} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${(analytics.failedStudents / analytics.totalStudents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Highest Score</span>
                    <span className="text-sm font-bold">{analytics.topScore} marks</span>
                  </div>
                  <p className="text-xs text-gray-600">Out of {analytics.maxMarks}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Lowest Score</span>
                    <span className="text-sm font-bold">{analytics.lowestScore} marks</span>
                  </div>
                  <p className="text-xs text-gray-600">Out of {analytics.maxMarks}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className="text-sm font-bold">
                      {analytics.classAverage}% ({Math.round((analytics.classAverage / 100) * analytics.maxMarks)} marks)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Class average</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
