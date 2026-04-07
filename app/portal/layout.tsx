import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { BottomNavigation } from '@/components/bottom-navigation'

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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,117,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,165,141,0.12),transparent_26%)]" />
      <header className="sticky top-0 z-40 border-b border-white/45 bg-background/72 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/portal" className="font-display text-2xl font-semibold text-foreground">
              School Portal
            </Link>
            <p className="mt-1 text-sm text-muted-foreground hidden md:block">
              Student and parent access, styled with the same design language.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground md:inline">{user.email}</span>
            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container relative mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
        <div className="page-shell">
          {children}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
