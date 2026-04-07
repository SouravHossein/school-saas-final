import Link from 'next/link'
import { headers } from 'next/headers'
import { CalendarDays, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { generateThemeCSS, parseThemeConfig } from '@/lib/theme-engine'
import { getSchoolFromRequest } from '@/lib/multitenant'

export default async function EventsPage() {
  const headerList = await headers()
  const school = await getSchoolFromRequest(headerList)

  if (!school) {
    return <div className="py-20 text-center">School not found</div>
  }

  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', school.id)
    .eq('is_published', true)
    .order('event_date', { ascending: true })

  const theme = parseThemeConfig(school.theme_config)

  return (
    <div className="min-h-screen">
      <style>{generateThemeCSS(theme)}</style>

      <header className="border-b border-white/40 bg-white/72 px-4 py-6 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <Button asChild variant="outline" className="mb-5">
            <Link href="/">Back to Home</Link>
          </Button>
          <h1 className="text-5xl font-semibold">Events</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            Stay current with upcoming programs, campus gatherings, and important dates.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10">
        {events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event: any) => (
              <article key={event.id} className="public-shell-card overflow-hidden">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-56 w-full object-cover"
                  />
                )}
                <div className="space-y-4 p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{event.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">{event.description}</p>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-shell-card px-6 py-10 text-center">
            <p className="text-muted">No events scheduled right now.</p>
          </div>
        )}
      </section>
    </div>
  )
}
