import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { SectionDeleteButton } from '@/components/section-delete-button'

export default async function SectionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's school
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  // Get sections for the school with class info
  const { data: sections } = await supabase
    .from('sections')
    .select('*, classes(name)')
    .eq('school_id', profile?.school_id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sections</h1>
          <p className="text-muted-foreground mt-1">
            Manage sections for your school
          </p>
        </div>
        <Link href="/sections/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </Link>
      </div>

      {/* Sections Table */}
      {sections && sections.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Class</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Students</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Room No</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 font-medium">{section.name}</td>
                      <td className="p-4">{section.classes?.name || '-'}</td>
                      <td className="p-4">{section.student_count || 0}</td>
                      <td className="p-4">{section.room_number || '-'}</td>
                      <td className="p-4 text-right space-x-2">
                        <Link href={`/sections/${section.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <SectionDeleteButton sectionId={section.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No sections yet</p>
            <Link href="/sections/new">
              <Button>Create your first section</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
