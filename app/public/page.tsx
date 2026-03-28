import { createClient } from '@/lib/supabase/server'
import { getSchoolFromRequest } from '@/lib/multitenant'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { headers } from 'next/headers'

export default async function PublicHomePage() {
  const headerList = await headers()
  const school = await getSchoolFromRequest(headerList)

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-gray-600">School not found</p>
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

  const themeConfig = school.theme_config || {}
  const homepageConfig = school.homepage_config || {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          {school.logo_url && (
            <img src={school.logo_url} alt={school.name} className="h-12 object-contain" />
          )}
          <h1 className="text-3xl font-bold" style={{ color: themeConfig.primary }}>
            {school.name}
          </h1>
          <div className="space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {homepageConfig.showHero && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-4">{homepageConfig.title}</h2>
            <p className="text-xl mb-8 opacity-90">{homepageConfig.description}</p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Learn More
            </Button>
          </div>
        </section>
      )}

      {/* Events Section */}
      {homepageConfig.showEvents && events && events.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold mb-8" style={{ color: themeConfig.primary }}>
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                {event.image_url && (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.event_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Teachers Section */}
      {homepageConfig.showTeachers && teachers && teachers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 bg-gray-50 rounded-lg">
          <h2 className="text-4xl font-bold mb-8" style={{ color: themeConfig.primary }}>
            Our Faculty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teachers.map((teacher: any) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-md p-6 text-center">
                {teacher.photo_url && (
                  <img 
                    src={teacher.photo_url} 
                    alt={teacher.full_name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <h3 className="text-lg font-bold">{teacher.full_name}</h3>
                {teacher.subject && <p className="text-gray-600">{teacher.subject}</p>}
                {teacher.qualification && (
                  <p className="text-sm text-gray-500 mt-2">{teacher.qualification}</p>
                )}
                {teacher.bio && (
                  <p className="text-gray-600 text-sm mt-4">{teacher.bio}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/mission">Our Mission</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Academics</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/programs">Programs</Link></li>
                <li><Link href="/admissions">Admissions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/news">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {school.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
