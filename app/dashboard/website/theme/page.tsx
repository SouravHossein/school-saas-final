'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

const FONTS = ['Inter', 'Roboto', 'Poppins', 'Playfair Display', 'Lora', 'Open Sans']

export default function ThemeCustomizer() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [school, setSchool] = useState<any>(null)
  const [theme, setTheme] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchSchool = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (!profile) return

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', profile.school_id)
        .single()

      setSchool(schoolData)
      setTheme(schoolData?.theme_config || {})
      setLoading(false)
    }

    fetchSchool()
  }, [])

  const handleThemeChange = (field: string, value: string) => {
    setTheme((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from('schools')
      .update({ theme_config: theme })
      .eq('id', school.id)

    setSaving(false)

    if (!error) {
      router.refresh()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Theme Customizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="primary"
                  type="color"
                  value={theme?.primary || '#0066cc'}
                  onChange={(e) => handleThemeChange('primary', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme?.primary || '#0066cc'}
                  onChange={(e) => handleThemeChange('primary', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="secondary"
                  type="color"
                  value={theme?.secondary || '#0066cc'}
                  onChange={(e) => handleThemeChange('secondary', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme?.secondary || '#0066cc'}
                  onChange={(e) => handleThemeChange('secondary', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="accent"
                  type="color"
                  value={theme?.accent || '#0066cc'}
                  onChange={(e) => handleThemeChange('accent', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme?.accent || '#0066cc'}
                  onChange={(e) => handleThemeChange('accent', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="background">Background Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="background"
                  type="color"
                  value={theme?.background || '#ffffff'}
                  onChange={(e) => handleThemeChange('background', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme?.background || '#ffffff'}
                  onChange={(e) => handleThemeChange('background', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="foreground">Text Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="foreground"
                  type="color"
                  value={theme?.foreground || '#1a1a1a'}
                  onChange={(e) => handleThemeChange('foreground', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={theme?.foreground || '#1a1a1a'}
                  onChange={(e) => handleThemeChange('foreground', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryFont">Body Font</Label>
              <select
                id="primaryFont"
                value={theme?.primaryFont || 'Inter'}
                onChange={(e) => handleThemeChange('primaryFont', e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="headingFont">Heading Font</Label>
              <select
                id="headingFont"
                value={theme?.headingFont || 'Inter'}
                onChange={(e) => handleThemeChange('headingFont', e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="borderRadius">Border Radius (rem)</Label>
              <Input
                id="borderRadius"
                type="number"
                step="0.25"
                value={theme?.borderRadius || '0.5'}
                onChange={(e) => handleThemeChange('borderRadius', e.target.value)}
                className="w-full mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              backgroundColor: theme?.background,
              color: theme?.foreground,
              padding: '2rem',
              borderRadius: `${theme?.borderRadius}rem`,
            }}
            className="space-y-4"
          >
            <h1
              style={{
                color: theme?.primary,
                fontFamily: `${theme?.headingFont}, sans-serif`,
              }}
              className="text-3xl font-bold"
            >
              Welcome to {school?.name}
            </h1>
            <p style={{ fontFamily: `${theme?.primaryFont}, sans-serif` }}>
              This is how your website will look with the selected colors and fonts.
            </p>
            <button
              style={{
                backgroundColor: theme?.primary,
                color: 'white',
                borderRadius: `${theme?.borderRadius}rem`,
              }}
              className="px-4 py-2 rounded"
            >
              Learn More
            </button>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Theme'}
      </Button>
    </div>
  )
}
