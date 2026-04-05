'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  DollarSign,
  Globe,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  PenTool,
  Settings,
  User,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navSections = [
  {
    title: 'Core',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/classes', label: 'Classes', icon: BookOpen },
      { href: '/sections', label: 'Sections', icon: Users },
      { href: '/students', label: 'Students', icon: User },
      { href: '/attendance', label: 'Attendance', icon: Calendar },
      { href: '/financial', label: 'Financial', icon: DollarSign },
      { href: '/fees', label: 'Fee Structures', icon: DollarSign },
      { href: '/announcements', label: 'Announcements', icon: Megaphone },
      { href: '/messages', label: 'Messages', icon: MessageCircle },
    ],
  },
  {
    title: 'Academics',
    items: [
      { href: '/dashboard/subjects', label: 'Subjects', icon: PenTool },
      { href: '/dashboard/exams', label: 'Exams', icon: PenTool },
      { href: '/dashboard/analytics/academics', label: 'Academic Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Business',
    items: [
      { href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
      { href: '/dashboard/analytics/finance', label: 'Finance Analytics', icon: BarChart3 },
      { href: '/dashboard/website', label: 'Website', icon: Globe },
    ],
  },
  {
    title: 'HR & Access',
    items: [
      { href: '/dashboard/hr/staff', label: 'Staff', icon: Briefcase },
      { href: '/dashboard/hr/salary-structures', label: 'Salary Structures', icon: DollarSign },
      { href: '/dashboard/hr/payroll', label: 'Payroll', icon: BarChart3 },
      { href: '/dashboard/hr/leaves', label: 'Leaves', icon: Calendar },
      { href: '/dashboard/settings/roles', label: 'Roles & Permissions', icon: Settings },
      { href: '/portal', label: 'My Portal', icon: User },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (path: string) =>
    pathname === path ||
    (path !== '/dashboard' && pathname.startsWith(path))

  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 xl:block">
      <div className="flex h-full flex-col border-r border-sidebar-border/60 bg-sidebar px-5 py-6 text-sidebar-foreground shadow-[20px_0_80px_-48px_rgba(15,23,42,0.85)]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.55)]">
          <div className="mb-4 inline-flex items-center rounded-full border border-sidebar-primary/30 bg-sidebar-primary/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-primary">
            School SaaS
          </div>
          <Link href="/dashboard" className="block space-y-2">
            <h1 className="font-display text-2xl font-semibold text-white">
              SchoolMgmt
            </h1>
            <p className="text-sm leading-6 text-sidebar-foreground/72">
              Elegant operations for academics, finance, HR, and communication.
            </p>
          </Link>
        </div>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/44">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all duration-200',
                        active
                          ? 'border-sidebar-primary/20 bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_18px_40px_-26px_rgba(242,201,109,0.75)]'
                          : 'border-transparent text-sidebar-foreground/76 hover:border-white/10 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                          active
                            ? 'border-black/8 bg-black/10'
                            : 'border-white/8 bg-white/5 group-hover:border-white/14 group-hover:bg-white/8',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
          <p className="mb-3 text-sm text-sidebar-foreground/72">
            Securely switch accounts when you need to manage a different school workspace.
          </p>
          <Button
            variant="outline"
            className="w-full justify-start border-white/12 bg-white/8 text-sidebar-foreground hover:bg-white/14 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}
