'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AttendanceMarker } from '@/components/attendance-marker'
import { Loader2 } from 'lucide-react'

interface Section {
  id: string
  name: string
  class_id: string
}

export default function AttendancePage() {
  const supabase = createClient()
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [schoolId, setSchoolId] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user profile to get school_id
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single()

        if (!profileData?.school_id) return

        setSchoolId(profileData.school_id)

        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, name, class_id')
          .eq('school_id', profileData.school_id)
          .order('name', { ascending: true })

        if (sectionsError) throw sectionsError

        setSections(sectionsData || [])
        if (sectionsData && sectionsData.length > 0) {
          setSelectedSectionId(sectionsData[0].id)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Attendance</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Section Selector */}
      <div className="space-y-2">
        <Label htmlFor="section-select">Select Section</Label>
        <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
          <SelectTrigger id="section-select">
            <SelectValue placeholder="Choose a section..." />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Marker */}
      {selectedSectionId && schoolId && (
        <AttendanceMarker sectionId={selectedSectionId} schoolId={schoolId} />
      )}
    </div>
  )
}
