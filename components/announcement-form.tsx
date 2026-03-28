'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface AnnouncementFormProps {
  announcement?: {
    id: string
    title: string
    content: string
    target_audience: string
    priority: string
  }
}

export default function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const [title, setTitle] = useState(announcement?.title || '')
  const [content, setContent] = useState(announcement?.content || '')
  const [targetAudience, setTargetAudience] = useState(
    announcement?.target_audience || 'all'
  )
  const [priority, setPriority] = useState(announcement?.priority || 'normal')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      if (announcement) {
        const { error: updateError } = await supabase
          .from('announcements')
          .update({
            title,
            content,
            target_audience: targetAudience,
            priority,
            updated_at: new Date().toISOString(),
          })
          .eq('id', announcement.id)
          .eq('school_id', profile.school_id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('announcements')
          .insert({
            school_id: profile.school_id,
            title,
            content,
            target_audience: targetAudience,
            priority,
            published_by: (await supabase.auth.getUser()).data.user?.id,
          })

        if (insertError) throw insertError
      }

      router.push('/announcements')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {announcement ? 'Edit Announcement' : 'Create Announcement'}
        </CardTitle>
        <CardDescription>
          {announcement
            ? 'Update your announcement details'
            : 'Create a new school announcement'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[200px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : announcement
                  ? 'Update Announcement'
                  : 'Create Announcement'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
