'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, MessageSquare, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Conversation {
  id: string
  title: string
  participantName: string
  lastMessage: string
  unreadCount: number
  lastMessageTime: string
}

interface Message {
  id: string
  content: string
  senderName: string
  senderId: string
  timestamp: string
  isOwn: boolean
}

export default function MessagingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setCurrentUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (!profile?.school_id) return

        // Get conversations
        const { data: conversationsData } = await supabase
          .from('conversations')
          .select(
            `
            id,
            title,
            created_by,
            conversation_participants (
              user_id,
              profiles:user_id (full_name)
            ),
            messages (
              content,
              created_at
            )
          `
          )
          .eq('school_id', profile.school_id)

        const formattedConversations: Conversation[] =
          conversationsData?.map((conv: any) => {
            const otherParticipant = conv.conversation_participants.find(
              (p: any) => p.user_id !== user.id
            )
            const lastMsg = conv.messages?.[conv.messages.length - 1]

            return {
              id: conv.id,
              title: conv.title,
              participantName: otherParticipant?.profiles?.full_name || 'Unknown',
              lastMessage: lastMsg?.content || 'No messages yet',
              unreadCount: 0,
              lastMessageTime: lastMsg?.created_at
                ? new Date(lastMsg.created_at).toLocaleTimeString()
                : '',
            }
          }) || []

        setConversations(formattedConversations)
        if (formattedConversations.length > 0) {
          setSelectedConversation(formattedConversations[0].id)
        }
      } catch (error) {
        console.error('[v0] Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      try {
        const { data: messagesData } = await supabase
          .from('messages')
          .select(
            `
            id,
            content,
            created_at,
            sender_id,
            profiles:sender_id (full_name)
          `
          )
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true })

        const formattedMessages: Message[] =
          messagesData?.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderName: msg.profiles?.full_name || 'Unknown',
            senderId: msg.sender_id,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isOwn: msg.sender_id === currentUserId,
          })) || []

        setMessages(formattedMessages)
      } catch (error) {
        console.error('[v0] Error fetching messages:', error)
      }
    }

    fetchMessages()
  }, [selectedConversation])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage,
      })

      setNewMessage('')

      // Refresh messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select(
          `
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (full_name)
        `
        )
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true })

      const formattedMessages: Message[] =
        messagesData?.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderName: msg.profiles?.full_name || 'Unknown',
          senderId: msg.sender_id,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: msg.sender_id === user.id,
        })) || []

      setMessages(formattedMessages)
    } catch (error) {
      console.error('[v0] Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with parents and teachers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Online Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">~2 hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Interface */}
      <div className="grid gap-4 md:grid-cols-4 h-96 md:h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 md:h-[480px]">
              <div className="space-y-2">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conv.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <p className="text-sm font-medium">{conv.participantName}</p>
                      <p className="text-xs truncate opacity-80">{conv.lastMessage}</p>
                      <p className="text-xs opacity-60 mt-1">{conv.lastMessageTime}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No conversations</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Display */}
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-sm">
                {selectedConversation
                  ? conversations.find((c) => c.id === selectedConversation)?.participantName
                  : 'Select a conversation'}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-64 md:h-[400px]">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No messages yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {selectedConversation && (
            <div className="border-t p-4 space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                  className="mt-auto"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
