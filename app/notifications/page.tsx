'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  content: string
  type: string
  is_read: boolean
  created_at: string
}

const typeColors: Record<string, string> = {
  announcement: 'bg-blue-100 text-blue-800',
  message: 'bg-green-100 text-green-800',
  system: 'bg-gray-100 text-gray-800',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

        setNotifications(data || [])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
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
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id)

    if (unreadIds.length === 0) return

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            All your announcements, messages, and updates
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            You&apos;re all caught up!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.is_read ? 'bg-muted/30' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      <Badge
                        className={typeColors[notification.type] || 'bg-gray-100 text-gray-800'}
                      >
                        {notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
