import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClassForm } from '@/components/class-form'

export default async function EditClassPage({
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

  const { data: classData } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .eq('school_id', profile?.school_id)
    .single()

  if (!classData) {
    redirect('/classes')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Class</h1>
        <p className="text-muted-foreground mt-1">Update class details</p>
      </div>
      <ClassForm
        schoolId={profile?.school_id!}
        classId={id}
        initialData={classData}
      />
    </div>
  )
}
