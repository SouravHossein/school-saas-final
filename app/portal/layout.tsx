import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Portal Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/portal" className="font-bold text-xl">
              School Portal
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Portal Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
