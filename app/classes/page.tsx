import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { ClassDeleteButton } from '@/components/class-delete-button'

export default async function ClassesPage() {
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

  // Get classes for the school
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', profile?.school_id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage classes for your school
          </p>
        </div>
        <Link href="/classes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </Link>
      </div>

      {/* Classes Table */}
      {classes && classes.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Grade</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Capacity</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 font-medium">{cls.name}</td>
                      <td className="p-4">{cls.grade}</td>
                      <td className="p-4">{cls.teacher_name || '-'}</td>
                      <td className="p-4">{cls.capacity || '-'}</td>
                      <td className="p-4 text-right space-x-2">
                        <Link href={`/classes/${cls.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <ClassDeleteButton classId={cls.id} />
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
            <p className="text-muted-foreground mb-4">No classes yet</p>
            <Link href="/classes/new">
              <Button>Create your first class</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
