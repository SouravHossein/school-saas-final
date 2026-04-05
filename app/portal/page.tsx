import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, CheckCircle2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

const featureList = [
  'View attendance records',
  'Check exam results and grades',
  'Track fee payments',
  'Receive announcements',
  'Message school staff',
]

export default async function PortalHomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: studentRecord } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: parentRecord } = await supabase
    .from('student_guardians')
    .select('id')
    .eq('guardian_id', user.id)
    .maybeSingle()

  const isStudent = !!studentRecord
  const isParent = !!parentRecord

  return (
    <div className="space-y-8">
      <section className="hero-panel grid-pattern overflow-hidden rounded-[2rem] border border-white/55 p-6 md:p-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
            Welcome to your school portal.
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Access academic information, school updates, and family-facing tools from one polished portal experience.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {isStudent && (
          <Card className="surface-card">
            <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Student Portal</CardTitle>
                <CardDescription className="mt-2 text-base leading-7">
                  View grades, attendance, fee information, and announcements in one place.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Stay on top of your academic journey with quick access to the records that matter most.
              </p>
              <Button asChild className="w-full">
                <Link href="/portal/student">Go to Student Portal</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isParent && (
          <Card className="surface-card">
            <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Parent Portal</CardTitle>
                <CardDescription className="mt-2 text-base leading-7">
                  Monitor your child&apos;s progress, attendance, and fee payments with less effort.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Get visibility into school life without needing to chase updates across different channels.
              </p>
              <Button asChild className="w-full">
                <Link href="/portal/parent">Go to Parent Portal</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isStudent && !isParent && (
          <Card className="surface-card md:col-span-2">
            <CardHeader>
              <CardTitle>No Portal Access Yet</CardTitle>
              <CardDescription>
                Your account is not currently linked to a student or parent record.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please contact your school administration team to connect your account.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="surface-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Features Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featureList.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.1rem] border border-white/55 bg-white/72 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                <p className="text-sm text-foreground/86">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7">
            <p className="text-foreground/86">
              For portal access issues, data questions, or technical support, contact your school administration team.
            </p>
            <p className="text-muted-foreground">
              If your school uses a dedicated support email, the staff can share it with you after your account is linked.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
