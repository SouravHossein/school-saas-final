'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Loader2, Megaphone, Pencil, Trash2 } from 'lucide-react'
import { AppPageHeader } from '@/components/app-page-header'
import { AppEmptyState } from '@/components/app-empty-state'

interface Announcement {
  id: string
  title: string
  content: string
  target_audience: string
  priority: string
  published_at: string
  is_active: boolean
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  normal: 'bg-gray-100 text-gray-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const audienceLabels: Record<string, string> = {
  all: 'All',
  teachers: 'Teachers',
  students: 'Students',
  parents: 'Parents',
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id, role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single()

        if (!profile) throw new Error('Profile not found')

        setUserRole(profile.role)

        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select('*')
          .eq('school_id', profile.school_id)
          .order('published_at', { ascending: false })

        if (fetchError) throw fetchError
        setAnnouncements(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const { error: deleteError } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setAnnouncements(announcements.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const isAdmin = ['super_admin', 'school_admin', 'teacher'].includes(userRole || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AppPageHeader
        eyebrow="Communication"
        title="Announcements"
        description="Publish school-wide updates with clearer visibility into audience, timing, and urgency."
        actions={
          isAdmin ? (
            <Button asChild size="lg">
              <Link href="/announcements/new">New Announcement</Link>
            </Button>
          ) : null
        }
      >
        <div className="rounded-[1.4rem] border border-white/55 bg-white/74 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Published items</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{announcements.length}</p>
        </div>
      </AppPageHeader>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">{error}</CardContent>
        </Card>
      )}

      {announcements.length === 0 ? (
        <AppEmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements yet"
          description="Use announcements to share timely updates with staff, students, parents, or the whole school."
          action={
            isAdmin ? (
              <Button asChild>
                <Link href="/announcements/new">Create announcement</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="surface-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {announcement.title}
                    </CardTitle>
                    <CardDescription>
                      {new Date(announcement.published_at).toLocaleDateString(
                        undefined,
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={priorityColors[announcement.priority] || 'bg-gray-100 text-gray-800'}
                    >
                      {announcement.priority}
                    </Badge>
                    <Badge variant="outline">
                      {audienceLabels[announcement.target_audience] || 'All'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap">
                  {announcement.content}
                </p>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Link href={`/announcements/${announcement.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
