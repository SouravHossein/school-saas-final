import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowRight, CalendarDays, GraduationCap, Sparkles, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { generateThemeCSS, parseThemeConfig } from '@/lib/theme-engine'
import { getSchoolFromRequest } from '@/lib/multitenant'

export default async function PublicHomePage() {
  const headerList = await headers()
  const school = await getSchoolFromRequest(headerList)

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="section-shell text-center">
          <h1 className="text-4xl font-semibold">School not found</h1>
          <p className="mt-3 text-muted-foreground">Check the domain or subdomain and try again.</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', school.id)
    .eq('is_published', true)
    .order('event_date', { ascending: true })
    .limit(3)

  const { data: teachers } = await supabase
    .from('teachers_public')
    .select('*')
    .eq('school_id', school.id)
    .eq('is_visible', true)
    .limit(6)

  const theme = parseThemeConfig(school.theme_config)
  const homepageConfig = {
    title: 'Welcome to School',
    description: 'Leading education institution',
    showHero: true,
    showEvents: true,
    showTeachers: true,
    ...school.homepage_config,
  }

  return (
    <div className="min-h-screen">
      <style>{generateThemeCSS(theme)}</style>

      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            {school.logo_url ? (
              <img src={school.logo_url} alt={school.name} className="h-12 w-12 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_18px_36px_-18px_rgba(74,117,255,0.75)]">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="font-display text-xl font-semibold">{school.name}</h1>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Public Website</p>
            </div>
          </Link>

          <Button asChild variant="outline">
            <Link href="/dashboard">Admin Login</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-10">
        {homepageConfig.showHero && (
          <section className="public-hero grid-pattern overflow-hidden rounded-[2rem] border border-white/45 px-6 py-12 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] md:px-8 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Distinctly branded for {school.name}
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
                    {homepageConfig.title}
                  </h2>
                  <p className="max-w-2xl text-lg leading-8 text-muted">
                    {homepageConfig.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/public/events">
                      Explore Events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/dashboard">Admin Login</Link>
                  </Button>
                </div>
              </div>

              <div className="public-shell-card grid gap-4 p-5 md:p-6">
                <div className="rounded-[1.5rem] bg-slate-950 px-5 py-5 text-white">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/60">School profile</p>
                  <p className="mt-3 text-3xl font-semibold">{school.name}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PublicInfo label="Branding" value="Custom theme ready" />
                  <PublicInfo label="Events" value={`${events?.length || 0} featured items`} />
                  <PublicInfo label="Faculty" value={`${teachers?.length || 0} visible profiles`} />
                  <PublicInfo label="Experience" value="Responsive website" />
                </div>
              </div>
            </div>
          </section>
        )}

        {homepageConfig.showEvents && events && events.length > 0 && (
          <section className="public-shell-card p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Upcoming</p>
                <h2 className="mt-2 text-4xl font-semibold">Events</h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/public/events">View all</Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {events.map((event: any) => (
                <article key={event.id} className="overflow-hidden rounded-[1.6rem] border border-white/55 bg-white/74">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="h-52 w-full object-cover"
                    />
                  )}
                  <div className="space-y-4 p-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{event.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{event.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {homepageConfig.showTeachers && teachers && teachers.length > 0 && (
          <section className="public-shell-card p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Faculty</p>
              <h2 className="mt-2 text-4xl font-semibold">Meet Our Educators</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {teachers.map((teacher: any) => (
                <article key={teacher.id} className="rounded-[1.6rem] border border-white/55 bg-white/74 p-5">
                  <div className="flex items-start gap-4">
                    {teacher.photo_url ? (
                      <img
                        src={teacher.photo_url}
                        alt={teacher.full_name}
                        className="h-20 w-20 rounded-[1.4rem] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-primary/10 text-primary">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{teacher.full_name}</h3>
                      {teacher.subject && <p className="text-sm text-muted">{teacher.subject}</p>}
                      {teacher.qualification && (
                        <p className="text-sm text-muted">{teacher.qualification}</p>
                      )}
                    </div>
                  </div>
                  {teacher.bio && (
                    <p className="mt-4 text-sm leading-7 text-muted">{teacher.bio}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function PublicInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/45 bg-white/75 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 font-medium text-foreground">{value}</p>
    </div>
  )
}
