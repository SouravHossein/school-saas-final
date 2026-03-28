'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  full_name: string
  role: string
}

export default function NewConversationPage() {
  const [title, setTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await supabase.auth.getUser()
        const userId = user.data.user?.id

        const { data: profileData } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', userId)
          .single()

        if (profileData) {
          setSchoolId(profileData.school_id)

          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('school_id', profileData.school_id)
            .neq('id', userId)
            .order('full_name')

          setUsers(usersData || [])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || selectedUsers.length === 0 || !schoolId) return

    setIsSaving(true)
    try {
      const user = await supabase.auth.getUser()
      const userId = user.data.user?.id

      // Create conversation
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          school_id: schoolId,
          title,
          created_by: userId,
          is_group: selectedUsers.length > 1,
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      const participants = [
        { conversation_id: convData.id, user_id: userId },
        ...selectedUsers.map((uid) => ({
          conversation_id: convData.id,
          user_id: uid,
        })),
      ]

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants)

      if (partError) throw partError

      router.push(`/messages/${convData.id}`)
    } finally {
      setIsSaving(false)
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
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">New Conversation</h1>
        <p className="text-muted-foreground mt-1">
          Start a new conversation with your colleagues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateConversation} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Conversation Title</Label>
              <Input
                id="title"
                placeholder="e.g., Math Department Meeting"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4">
              <Label>Select Participants</Label>
              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No other users available
                  </p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                      <Label
                        htmlFor={user.id}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <div>
                          <p>{user.full_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user.role}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving || !title.trim() || selectedUsers.length === 0}>
                {isSaving ? 'Creating...' : 'Create Conversation'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
