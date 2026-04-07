'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Pencil, Plus, Trash2, FileText } from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [filteredExams, setFilteredExams] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
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
        setFilteredExams(examsData || [])
      } catch (error) {
        console.error('Error fetching exams:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = exams.filter((exam) =>
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.classes?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredExams(filtered)
  }, [searchTerm, exams])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('exams').delete().eq('id', id)

      if (error) throw error

      setExams(exams.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Error deleting exam:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading exams...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exams</h1>
          <p className="text-gray-600">Manage school examinations</p>
        </div>
        <Link href="/dashboard/exams/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Exam
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>Total exams: {filteredExams.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Search by exam name or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Exam Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Class</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{exam.name}</td>
                    <td className="py-3 px-4">{exam.classes?.name}</td>
                    <td className="py-3 px-4">{new Date(exam.exam_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 capitalize">{exam.exam_type}</td>
                    <td className="py-3 px-4">
                      <Badge variant={exam.is_published ? 'default' : 'outline'}>
                        {exam.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/dashboard/exams/${exam.id}/marks`}>
                          <Button size="sm" variant="ghost" title="Mark Attendance">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/exams/${exam.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(exam.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredExams.length === 0 && (
              <div className="text-center py-8 text-gray-500">No exams found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
