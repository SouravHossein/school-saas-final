'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, BookOpen, Users, User, Calendar, DollarSign, PenTool, Megaphone, MessageCircle, Globe, BarChart3, Briefcase, Settings } from 'lucide-react'
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
        <NavLink
          href="/financial"
          icon={<DollarSign className="w-4 h-4" />}
          label="Financial"
          active={pathname.startsWith('/financial')}
        />
        <NavLink
          href="/fees"
          icon={<DollarSign className="w-4 h-4" />}
          label="Fee Structures"
          active={pathname.startsWith('/fees')}
        />
        <NavLink
          href="/dashboard/subjects"
          icon={<PenTool className="w-4 h-4" />}
          label="Subjects"
          active={pathname.startsWith('/dashboard/subjects')}
        />
        <NavLink
          href="/dashboard/exams"
          icon={<PenTool className="w-4 h-4" />}
          label="Exams"
          active={pathname.startsWith('/dashboard/exams')}
        />
        <NavLink
          href="/announcements"
          icon={<Megaphone className="w-4 h-4" />}
          label="Announcements"
          active={pathname.startsWith('/announcements')}
        />
        <NavLink
          href="/messages"
          icon={<MessageCircle className="w-4 h-4" />}
          label="Messages"
          active={pathname.startsWith('/messages')}
        />
        <NavLink
          href="/dashboard/website"
          icon={<Globe className="w-4 h-4" />}
          label="Website"
          active={pathname.startsWith('/dashboard/website')}
        />

        {/* Analytics Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">Analytics</p>
          <NavLink
            href="/dashboard/analytics/finance"
            icon={<BarChart3 className="w-4 h-4" />}
            label="Finance Analytics"
            active={pathname.includes('/analytics/finance')}
          />
          <NavLink
            href="/dashboard/analytics/academics"
            icon={<BarChart3 className="w-4 h-4" />}
            label="Academic Analytics"
            active={pathname.includes('/analytics/academics')}
          />
        </div>

        {/* Payments Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <NavLink
            href="/dashboard/payments"
            icon={<DollarSign className="w-4 h-4" />}
            label="Payments"
            active={pathname.startsWith('/dashboard/payments')}
          />
        </div>

        {/* HR & Payroll Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">HR & Payroll</p>
          <NavLink
            href="/dashboard/hr/staff"
            icon={<Briefcase className="w-4 h-4" />}
            label="Staff"
            active={pathname.startsWith('/dashboard/hr/staff')}
          />
          <NavLink
            href="/dashboard/hr/salary-structures"
            icon={<DollarSign className="w-4 h-4" />}
            label="Salary Structures"
            active={pathname.startsWith('/dashboard/hr/salary-structures')}
          />
          <NavLink
            href="/dashboard/hr/payroll"
            icon={<BarChart3 className="w-4 h-4" />}
            label="Payroll"
            active={pathname.startsWith('/dashboard/hr/payroll')}
          />
          <NavLink
            href="/dashboard/hr/leaves"
            icon={<Calendar className="w-4 h-4" />}
            label="Leaves"
            active={pathname.startsWith('/dashboard/hr/leaves')}
          />
        </div>

        {/* Settings Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">Settings</p>
          <NavLink
            href="/dashboard/settings/roles"
            icon={<Settings className="w-4 h-4" />}
            label="Roles & Permissions"
            active={pathname.startsWith('/dashboard/settings/roles')}
          />
        </div>
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
