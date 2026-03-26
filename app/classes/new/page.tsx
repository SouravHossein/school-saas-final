import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClassForm } from '@/components/class-form'

export default async function NewClassPage() {
  const supabase = await createClient()

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

  if (!profile?.school_id) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">New Class</h1>
        <p className="text-muted-foreground mt-1">Create a new class for your school</p>
      </div>
      <ClassForm schoolId={profile.school_id} />
    </div>
  )
}
