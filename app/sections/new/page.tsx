import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SectionForm } from '@/components/section-form'

export default async function NewSectionPage() {
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
        <h1 className="text-3xl font-bold text-foreground">New Section</h1>
        <p className="text-muted-foreground mt-1">Create a new section for your school</p>
      </div>
      <SectionForm schoolId={profile.school_id} />
    </div>
  )
}
