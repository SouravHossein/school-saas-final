'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Award, Calendar, ArrowRight, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SchoolInfo {
  id: string
  name: string
  logo_url: string
  website_domain: string
  homepage_config: any
  theme_config: any
}

interface Feature {
  icon: any
  title: string
  description: string
}

export default function PublicWebsite() {
  const router = useRouter()
  const supabase = createClient()
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        // Get subdomain or domain from window location
        const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
        const subdomain = hostname.split('.')[0]

        // Try to find school by subdomain or custom domain
        let query = supabase.from('schools').select('*')

        if (subdomain !== 'localhost' && subdomain !== 'www') {
          query = query.or(`subdomain.eq.${subdomain},custom_domain.eq.${hostname}`)
        }

        const { data } = await query.single()

        if (data) {
          setSchoolInfo(data)
          // Apply theme if configured
          if (data.theme_config?.mode) {
            setThemeMode(data.theme_config.mode)
          }
        }
      } catch (error) {
        console.error('[v0] Error fetching school info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchoolInfo()
  }, [])

  const features: Feature[] = [
    {
      icon: BookOpen,
      title: 'Quality Education',
      description:
        'Comprehensive curriculum designed to develop critical thinking and practical skills.',
    },
    {
      icon: Users,
      title: 'Expert Faculty',
      description:
        'Experienced and dedicated teachers committed to student success and personal growth.',
    },
    {
      icon: Award,
      title: 'Proven Results',
      description:
        'Consistent academic excellence with high student achievement rates and awards.',
    },
    {
      icon: Calendar,
      title: 'Rich Activities',
      description:
        'Diverse co-curricular programs including sports, arts, and community service.',
    },
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Parent',
      feedback:
        'Excellent school with dedicated teachers and great facilities. My child has grown tremendously.',
    },
    {
      name: 'Priya Sharma',
      role: 'Student',
      feedback:
        'The school has provided me with great opportunities to learn and develop my skills.',
    },
    {
      name: 'Amit Patel',
      role: 'Parent',
      feedback:
        'Very impressed with the holistic approach to education and student well-being.',
    },
  ]

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-slate-950' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {schoolInfo?.logo_url && (
                <img src={schoolInfo.logo_url} alt="Logo" className="h-8 w-8 rounded" />
              )}
              <span className="font-bold text-xl">{schoolInfo?.name || 'School Name'}</span>
            </div>
            <div className="flex gap-6">
              <Link href="/" className="text-sm hover:text-primary">
                Home
              </Link>
              <Link href="/about" className="text-sm hover:text-primary">
                About
              </Link>
              <Link href="/admission" className="text-sm hover:text-primary">
                Admission
              </Link>
              <Link href="/contact" className="text-sm hover:text-primary">
                Contact
              </Link>
            </div>
            <Button variant="default">Apply Now</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to {schoolInfo?.name}</h1>
          <p className="text-xl mb-8 opacity-90">
            Nurturing minds, building futures, and creating leaders for tomorrow
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Explore More
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white">
              Schedule Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card key={idx} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Our Programs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Primary Section', grades: 'Grades 1-5', description: 'Foundation building' },
              { name: 'Secondary Section', grades: 'Grades 6-10', description: 'Core competencies' },
              { name: 'Senior Section', grades: 'Grades 11-12', description: 'Higher learning' },
            ].map((program, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{program.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {program.grades}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                  <Button variant="ghost" className="w-full">
                    Learn More <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-blue-600">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic">"{testimonial.feedback}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start your journey to excellence. Apply for admission today.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Apply for Admission
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/mission">Our Mission</Link>
                </li>
                <li>
                  <Link href="/team">Team</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/programs/primary">Primary</Link>
                </li>
                <li>
                  <Link href="/programs/secondary">Secondary</Link>
                </li>
                <li>
                  <Link href="/programs/senior">Senior</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/news">News</Link>
                </li>
                <li>
                  <Link href="/events">Events</Link>
                </li>
                <li>
                  <Link href="/gallery">Gallery</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@school.com</li>
                <li>Phone: +91-XXXXXXXXXX</li>
                <li>Location: City, State</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">&copy; 2024 {schoolInfo?.name}. All rights reserved.</p>
              <div className="flex gap-4 text-sm text-gray-400">
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
