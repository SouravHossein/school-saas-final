'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/portal', icon: Home, label: 'Home' },
  { href: '/dashboard', icon: Users, label: 'Dashboard' },
  { href: '/portal/student/attendance', icon: FileText, label: 'Attendance' },
  { href: '/dashboard/messages', icon: Bell, label: 'Messages' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 py-3 px-2 flex flex-col items-center justify-center text-xs font-medium transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
