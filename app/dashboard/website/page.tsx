import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default async function WebsiteDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div>Profile not found</div>
  }

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile.school_id)
    .single()

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('created_at', { ascending: false })

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('event_date', { ascending: false })

  const { data: teachers } = await supabase
    .from('teachers_public')
    .select('*')
    .eq('school_id', profile.school_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Website Management</h1>
        <a href={`http://${school.subdomain}.localhost:3000`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">View Website</Button>
        </a>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="teachers">Faculty</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Pages</h2>
            <Link href="/dashboard/website/pages/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </Link>
          </div>

          {pages && pages.length > 0 ? (
            <div className="space-y-4">
              {pages.map((page: any) => (
                <Card key={page.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{page.title}</h3>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="space-x-2">
                        <Link href={`/dashboard/website/pages/${page.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pages created yet</p>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Events</h2>
            <Link href="/dashboard/website/events/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event: any) => (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${event.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {event.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="space-x-2">
                        <Link href={`/dashboard/website/events/${event.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No events created yet</p>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Faculty</h2>
            <Link href="/dashboard/website/teachers/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </Link>
          </div>

          {teachers && teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher: any) => (
                <Card key={teacher.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{teacher.subject}</h3>
                        <p className="text-sm text-gray-600">{teacher.qualification}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${teacher.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {teacher.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No faculty members added yet</p>
          )}
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <h2 className="text-2xl font-bold">Theme Settings</h2>
          <Link href="/dashboard/website/theme">
            <Button>
              <Edit2 className="w-4 h-4 mr-2" />
              Customize Theme
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-4">
          <h2 className="text-2xl font-bold">Homepage Settings</h2>
          <Link href="/dashboard/website/homepage">
            <Button>
              <Edit2 className="w-4 h-4 mr-2" />
              Configure Homepage
            </Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  )
}
