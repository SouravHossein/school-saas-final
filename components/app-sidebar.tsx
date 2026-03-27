'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, BookOpen, Users, User, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (path: string) => pathname === path

  return (
    <aside className="border-r border-border bg-background w-64 flex flex-col h-screen sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">SchoolMgmt</h1>
        <p className="text-xs text-muted-foreground mt-1">School Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          href="/dashboard"
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          active={isActive('/dashboard')}
        />
        <NavLink
          href="/classes"
          icon={<BookOpen className="w-4 h-4" />}
          label="Classes"
          active={isActive('/classes')}
        />
        <NavLink
          href="/sections"
          icon={<Users className="w-4 h-4" />}
          label="Sections"
          active={isActive('/sections')}
        />
        <NavLink
          href="/students"
          icon={<User className="w-4 h-4" />}
          label="Students"
          active={pathname.startsWith('/students')}
        />
        <NavLink
          href="/attendance"
          icon={<Calendar className="w-4 h-4" />}
          label="Attendance"
          active={pathname.startsWith('/attendance')}
        />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link href={href}>
      <Button
        variant={active ? 'default' : 'ghost'}
        className="w-full justify-start"
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </Link>
  )
}
