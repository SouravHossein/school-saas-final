'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Pencil, Plus, Trash2 } from 'lucide-react'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([])
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

        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', profileData?.school_id)
          .order('name')

        setSubjects(subjectsData || [])
        setFilteredSubjects(subjectsData || [])
      } catch (error) {
        console.error('Error fetching subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSubjects(filtered)
  }, [searchTerm, subjects])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('subjects').delete().eq('id', id)

      if (error) throw error

      setSubjects(subjects.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Error deleting subject:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading subjects...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-gray-600">Manage school subjects</p>
        </div>
        <Link href="/dashboard/subjects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>Total subjects: {filteredSubjects.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Code</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{subject.name}</td>
                    <td className="py-3 px-4">
                      <code className="bg-gray-100 px-2 py-1 rounded">{subject.code}</code>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={subject.is_active ? 'default' : 'outline'}>
                        {subject.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/dashboard/subjects/${subject.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(subject.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">No subjects found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
