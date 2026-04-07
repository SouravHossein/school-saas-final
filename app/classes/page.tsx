import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Edit, Plus } from 'lucide-react'
import { ClassDeleteButton } from '@/components/class-delete-button'
import { AppPageHeader } from '@/components/app-page-header'
import { AppEmptyState } from '@/components/app-empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      <AppPageHeader
        eyebrow="Academics"
        title="Classes"
        description="Manage the academic structure of your school with clearer listings, stronger hierarchy, and faster actions."
        actions={
          <Button asChild size="lg">
            <Link href="/classes/new">
              <Plus className="h-4 w-4" />
              Add Class
            </Link>
          </Button>
        }
      >
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
          <div className="rounded-[1.4rem] border border-white/55 bg-white/74 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total classes</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{classes?.length || 0}</p>
          </div>
        </div>
      </AppPageHeader>

      {classes && classes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium text-foreground">{cls.name}</TableCell>
                <TableCell>{cls.grade}</TableCell>
                <TableCell>{cls.teacher_name || '-'}</TableCell>
                <TableCell>{cls.capacity || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/classes/${cls.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ClassDeleteButton classId={cls.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <AppEmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No classes yet"
          description="Start building your academic structure by creating the first class for this school."
          action={
            <Button asChild>
              <Link href="/classes/new">Create your first class</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
