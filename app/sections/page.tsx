import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit, Plus, Users } from 'lucide-react'
import { SectionDeleteButton } from '@/components/section-delete-button'
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
      <AppPageHeader
        eyebrow="Organization"
        title="Sections"
        description="Organize classes into sections with room allocation, enrollment visibility, and cleaner day-to-day management."
        actions={
          <Button asChild size="lg">
            <Link href="/sections/new">
              <Plus className="h-4 w-4" />
              Add Section
            </Link>
          </Button>
        }
      >
        <div className="rounded-[1.4rem] border border-white/55 bg-white/74 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total sections</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{sections?.length || 0}</p>
        </div>
      </AppPageHeader>

      {sections && sections.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Room No</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className="font-medium text-foreground">{section.name}</TableCell>
                <TableCell>{section.classes?.name || '-'}</TableCell>
                <TableCell>{section.student_count || 0}</TableCell>
                <TableCell>{section.room_number || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/sections/${section.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <SectionDeleteButton sectionId={section.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <AppEmptyState
          icon={<Users className="h-6 w-6" />}
          title="No sections yet"
          description="Create sections to divide classes into manageable groups with clearer room and student tracking."
          action={
            <Button asChild>
              <Link href="/sections/new">Create your first section</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
