'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AnnouncementForm from '@/components/announcement-form'
import { Loader2 } from 'lucide-react'

export default function EditAnnouncementPage() {
  const params = useParams()
  const id = params.id as string
  const [announcement, setAnnouncement] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', id)
          .single()

        setAnnouncement(data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncement()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="space-y-6 p-6 max-w-2xl mx-auto">
        <p className="text-red-500">Announcement not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Edit Announcement</h1>
        <p className="text-muted-foreground mt-1">
          Update your announcement details
        </p>
      </div>
      <AnnouncementForm announcement={announcement} />
    </div>
  )
}
