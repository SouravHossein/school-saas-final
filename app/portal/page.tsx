import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users } from 'lucide-react'
import Link from 'next/link'

export default async function PortalHomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is a student or parent
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
    <div className="space-y-8 max-w-4xl">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold">Welcome to Your School Portal</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Access your academic information and stay connected with your school
        </p>
      </div>

      {/* Portal Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isStudent && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Student Portal
              </CardTitle>
              <CardDescription>
                Access your grades, attendance, and fee information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View your academic progress, exam results, attendance records, and fee status in one place.
              </p>
              <Link href="/portal/student" className="w-full">
                <Button className="w-full">Go to Student Portal</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isParent && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Parent Portal
              </CardTitle>
              <CardDescription>
                Monitor your children's academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Keep track of your children's attendance, exam results, and fee payments from a single dashboard.
              </p>
              <Link href="/portal/parent" className="w-full">
                <Button className="w-full">Go to Parent Portal</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isStudent && !isParent && (
          <Card>
            <CardHeader>
              <CardTitle>No Portal Access</CardTitle>
              <CardDescription>
                Your account is not linked to any student or parent records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please contact your school administration to set up your portal access.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Features Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ View attendance records</p>
            <p>✓ Check exam results and grades</p>
            <p>✓ Track fee payments</p>
            <p>✓ Receive announcements</p>
            <p>✓ Message school staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>For technical support or questions about the portal:</p>
            <p className="text-muted-foreground">
              Contact your school's administration team or email support@school.edu
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
