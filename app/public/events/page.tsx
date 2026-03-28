import { createClient } from '@/lib/supabase/server'
import { getSchoolFromRequest } from '@/lib/multitenant'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EventsPage() {
  const headerList = await headers()
  const school = await getSchoolFromRequest(headerList)

  if (!school) {
    return <div className="text-center py-20">School not found</div>
  }

  const supabase = await createClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', school.id)
    .eq('is_published', true)
    .order('event_date', { ascending: true })

  const themeConfig = school.theme_config || {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-4">Back to Home</Button>
          </Link>
          <h1 className="text-4xl font-bold" style={{ color: themeConfig.primary }}>
            Events
          </h1>
        </div>
      </header>

      {/* Events Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {event.image_url && (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                    {event.location && <p>Location: {event.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-8">No events scheduled</p>
        )}
      </section>
    </div>
  )
}
