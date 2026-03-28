'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Loader2, MessageCircle, Plus } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  is_group: boolean
  created_at: string
  message_count?: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id
        if (!userId) return

        const { data, error } = await supabase
          .from('conversation_participants')
          .select(
            `
            conversation_id,
            conversations (
              id,
              title,
              is_group,
              created_at
            )
          `
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const conversations = data?.map((item: any) => item.conversations) || []
        setConversations(conversations)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <MessageCircle className="w-8 h-8" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Your conversations and direct messages
          </p>
        </div>
        <Link href="/messages/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </Link>
      </div>

      <div>
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {searchTerm
              ? 'No conversations found'
              : 'No conversations yet. Start a new one!'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Link key={conversation.id} href={`/messages/${conversation.id}`}>
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{conversation.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {conversation.is_group ? 'Group chat' : 'Direct message'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
