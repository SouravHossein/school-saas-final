'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender_name?: string
}

interface Conversation {
  id: string
  title: string
  is_group: boolean
}

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await supabase.auth.getUser()
        setUserId(user.data.user?.id || null)

        // Fetch conversation
        const { data: convData } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()

        setConversation(convData)

        // Fetch messages with profile information
        const { data: messagesData } = await supabase
          .from('messages')
          .select(
            `
            id,
            content,
            sender_id,
            created_at,
            profiles!sender_id (full_name)
          `
          )
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesData) {
          setMessages(
            messagesData.map((msg: any) => ({
              ...msg,
              sender_name: msg.profiles?.full_name || 'Unknown',
            }))
          )
        }

        // Mark as read
        await supabase
          .from('conversation_participants')
          .update({ last_read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('user_id', user.data.user?.id)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [conversationId])

  // Subscribe to new messages using polling (Realtime may require subscription setup)
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: newMessages } = await supabase
        .from('messages')
        .select(
          `
          id,
          content,
          sender_id,
          created_at,
          profiles!sender_id (full_name)
        `
        )
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (newMessages) {
        setMessages(
          newMessages.map((msg: any) => ({
            ...msg,
            sender_name: msg.profiles?.full_name || 'Unknown',
          }))
        )
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim() || !userId) return

    setIsSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: messageContent,
      })

      if (error) throw error

      setMessageContent('')
      // Messages will be fetched by the polling interval
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <p className="text-red-500">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="py-4">
          <CardTitle>{conversation.title}</CardTitle>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === userId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {conversation.is_group && message.sender_id !== userId && (
                  <p className="text-xs font-semibold mb-1">
                    {message.sender_name}
                  </p>
                )}
                <p className="text-sm break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !messageContent.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
