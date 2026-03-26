import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SectionForm } from '@/components/section-form'

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  const { data: sectionData } = await supabase
    .from('sections')
    .select('*')
    .eq('id', id)
    .eq('school_id', profile?.school_id)
    .single()

  if (!sectionData) {
    redirect('/sections')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Section</h1>
        <p className="text-muted-foreground mt-1">Update section details</p>
      </div>
      <SectionForm
        schoolId={profile?.school_id!}
        sectionId={id}
        initialData={sectionData}
      />
    </div>
  )
}
