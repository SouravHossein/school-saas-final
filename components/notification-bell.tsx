'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  content: string
  type: string
  is_read: boolean
  created_at: string
  related_id?: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = await supabase.auth.getUser()
        if (!user.data.user?.id) return

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.data.user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (data) {
          setNotifications(data)
          setUnreadCount(data.filter((n) => !n.is_read).length)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()

    // Poll for new notifications
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <DropdownMenu>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-2 cursor-pointer"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <p className="font-medium text-sm">{notification.title}</p>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.content.substring(0, 50)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Link href="/notifications">
              <DropdownMenuItem className="justify-center cursor-pointer">
                View All Notifications
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
